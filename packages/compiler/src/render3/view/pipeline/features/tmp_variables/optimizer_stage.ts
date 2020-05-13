import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';
import {NextContextExpr} from '../embedded_views/next_context';
import {ReferenceExpr} from '../reference';

import {VarExpr} from './expression';
import {Var, VarId} from './node';

/**
 * Optimizes the variables within a template.
 *
 * Rules of inlining:
 * 1) It is illegal to move a `NextContext` or `Reference` operation past a `NextContext`.
 * 2) Only variables with single references may be inlined.
 */
export class VariableOptimizerStage extends ir.UpdateOnlyTemplateStage implements
    ir.UpdateTransform {
  visitList(list: ir.UpdateList): void {
    // Scan through the list once, and establish:
    // * which expressions contain hazards (`NextContext`).
    // * which variables have sensitive expressions (those that cannot be inlined past hazards).
    // * which variables are used where (either not at all, or once, or many times).
    const mapper = new VariableMapper();
    for (let node = list.head; node !== null; node = node.next) {
      node.visitExpressions(mapper, node);
    }
    const {usages, hazards, sensitive, nextNextContext} = mapper;

    // Firstly, remove all unused variables. This cleans up the set of hazards, which can allow for
    // more inlining. This iteration starts at the tail because removing a later variable can cause
    // an earlier one to become unused as well.
    let node = list.tail;
    while (node !== null) {
      // Skip non-Vars, or vars which are used.
      if (!(node instanceof Var)) {
        // Not a variable.
        node = node.prev;
        continue;
      }

      if (usages.has(node.id)) {
        const usageMap = usages.get(node.id)!;
        if (usageMap.size > 0) {
          node = node.prev;
          continue;
        }
      }

      // Is this variable implicitly used in a context-sensitive expression (like `Reference`) which
      // occurs before the next hazard? It cannot be removed if so.
      if (hazards.has(node)) {
        let isSensitive = false;
        for (let cursor = node.next; cursor !== null && !hazards.has(cursor) && !isSensitive;
             cursor = cursor.next) {
          if (sensitive.has(cursor)) {
            isSensitive = true;
          }
        }
        if (isSensitive) {
          node = node.prev;
          continue;
        }
      }


      // Dead variable - never used.
      // Eliminate it - but be careful about eliminating calls to `NextContext` which are
      // side-effectful.
      if (hazards.has(node)) {
        // The node possibly contains a `NextContext` call. Ensure that its side effect is
        // propagated to the next `NextContext` call if there is one.
        node.visitExpressions(new PropagateNextContext(nextNextContext));
      }

      // This variable might reference other variables, and those references should not be counted
      // as usages anymore.
      node.visitExpressions(new RemoveVarUsagesFromNode(node, usages));

      const prev = node.prev;
      list.remove(node);
      node = prev;
    }

    // Next, scan nodes from beginning to end. When a variable is encountered, see if:
    // 1) it has only one usage, and
    // 2) it's legal to inline the variable into the statement which uses it.
    node = list.head;
    while (node !== null) {
      if (!(node instanceof Var)) {
        // Skip non-Vars.
        node = node.next;
        continue;
      }


      // Unused variables have been removed in the previous pass, so it's safe to assume that there
      // is a record of usage.
      const usageMap = usages.get(node.id);
      if (usageMap === undefined || usageMap.size !== 1) {
        // This variable is used multiple times, and is thus not a candidate for inlining.
        node = node.next;
        continue;
      }

      const [usage, usageCount]: [ir.UpdateNode, number] = usageMap.entries().next().value;
      if (usageCount > 1) {
        node = node.next;
        continue;
      }

      const isHazard = hazards.has(node);
      const isSensitive = sensitive.has(node);
      if (isHazard || isSensitive) {
        // This variable is a candidate for inlining, but contains a sensitive expression such as
        // NextContext or Reference. It cannot be inlined across a hazard. Verify that no hazards
        // exist from the usage expression (inclusive) to the variable declaration (exclusive)
        // This variable is so far a candidate for inlining. Next, walk backwards from the usage
        // to the variable declaration and validate that no hazards are passed.
        const current = node;
        let isInlineable = true;
        for (let cursor = usage; cursor !== current && isInlineable; cursor = cursor.prev!) {
          // It's never okay to inline across a hazard, and it's never okay to inline a hazard
          // across a sensitive operation.
          isInlineable = !hazards.has(cursor) && (!isHazard || !sensitive.has(cursor));
        }

        if (!isInlineable) {
          node = node!.next
          continue;
        }
      }

      // Inlining is legal! Some bookkeeping first.
      if (sensitive.has(node)) {
        sensitive.delete(node);
        sensitive.add(usage);
      }
      if (hazards.has(node)) {
        hazards.delete(node);
        hazards.add(usage);
      }

      // Finally, inline the variable.
      usage.visitExpressions(new InlineOneVariable(node.id, node.value));
      node = list.remove(node);
    }
  }
}

class VariableMapper extends ir.ExpressionTransformer<ir.UpdateNode> {
  /**
   * Tracks the node in which each variable is used, or 'multiple' if more than one.
   */
  readonly usages = new Map<VarId, Map<ir.UpdateNode, number>>();

  /**
   * Those nodes with expressions that contain hazards.
   */
  readonly hazards = new Set<ir.UpdateNode>();

  /**
   * Tracks the `NextContext` operation which follows any given `NextContext`.
   *
   * Gotta love the name.
   */
  readonly nextNextContext = new Map<NextContextExpr, NextContextExpr>();

  /**
   * Those nodes with expressions that cannot be inlined past hazards.
   */
  readonly sensitive = new Set<ir.UpdateNode>();

  /**
   * The last `NextContext` operation seen.
   *
   * Used in the construction of the `nextNextContext` map.
   */
  private prevNextContext: NextContextExpr|null = null;

  visitIrExpression(expr: ir.Expression, node: ir.UpdateNode): o.Expression {
    expr.visitChildren(this, node);
    if (expr instanceof NextContextExpr) {
      this.hazards.add(node);

      // Populate `nextNextContext` if this isn't the first `NextContext` expression seen.
      if (this.prevNextContext !== null) {
        this.nextNextContext.set(this.prevNextContext, expr);
      }
      this.prevNextContext = expr;
    } else if (expr instanceof ReferenceExpr) {
      this.sensitive.add(node);
    } else if (expr instanceof VarExpr) {
      if (!this.usages.has(expr.id)) {
        this.usages.set(expr.id, new Map<ir.UpdateNode, number>());
      }
      const map = this.usages.get(expr.id)!;
      if (!map.has(node)) {
        map.set(node, 1);
      } else {
        map.set(node, map.get(node)! + 1);
      }
    }
    return expr;
  }
}

class PropagateNextContext extends ir.ExpressionTransformer {
  constructor(private nextNextContext: Map<NextContextExpr, NextContextExpr>) {
    super();
  }

  visitIrExpression(expr: ir.Expression) {
    expr.visitChildren(this);
    if (expr instanceof NextContextExpr && this.nextNextContext.has(expr)) {
      const nextNextContextExpr = this.nextNextContext.get(expr)!;
      nextNextContextExpr.jump += expr.jump;
    }
    return expr;
  }
}

class RemoveVarUsagesFromNode extends ir.ExpressionTransformer {
  constructor(private node: ir.UpdateNode, private usages: Map<VarId, Map<ir.UpdateNode, number>>) {
    super();
  }

  visitIrExpression(expr: ir.Expression): o.Expression {
    expr.visitChildren(this);
    if (expr instanceof VarExpr) {
      this.usages.get(expr.id)!.delete(this.node);
    }
    return expr;
  }
}

class InlineOneVariable extends ir.ExpressionTransformer {
  private inlined = false;
  constructor(private id: VarId, private inlineExpr: o.Expression) {
    super();
  }

  visitIrExpression(expr: ir.Expression): o.Expression {
    expr.visitChildren(this);
    if (!(expr instanceof VarExpr) || expr.id !== this.id) {
      return expr;
    }

    if (this.inlined === true) {
      throw new Error('AssertionError: found multiple instances of variable during inlining');
    }

    this.inlined = true;
    return this.inlineExpr;
  }
}
