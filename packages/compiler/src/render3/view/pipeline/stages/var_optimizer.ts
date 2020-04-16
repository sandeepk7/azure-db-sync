import * as o from '../../../../output/output_ast';
import * as uir from '../ir/update';
import {ExpressionTransformer} from '../util/expression_transformer';
import {UpdateOnlyTemplateStage} from './base';

/**
 * Optimizes the variables within a template.
 *
 * Rules of inlining:
 * 1) It is illegal to move a `NextContext` or `Reference` operation past a `NextContext`.
 * 2) Only variables with single references may be inlined.
 */
export class VariableOptimizerStage extends UpdateOnlyTemplateStage implements uir.Transform {
  visitList(list: uir.List): void {
    // Scan through the list once, and establish:
    // * which expressions contain hazards (`NextContext`).
    // * which variables have sensitive expressions (those that cannot be inlined past hazards).
    // * which variables are used where (either not at all, or once, or many times).
    const mapper = new VariableMapper();
    for (let node = list.head; node !== null; node = node.next) {
      uir.visitAllExpressions(node, mapper, node);
    }
    const {usages, hazards, sensitive, nextNextContext} = mapper;

    // Firstly, remove all unused variables. This cleans up the set of hazards, which can allow for
    // more inlining. This iteration starts at the tail because removing a later variable can cause
    // an earlier one to become unused as well.
    let node = list.tail;
    while (node !== null) {
      // Skip non-Vars, or vars which are used.
      if (node.kind !== uir.NodeKind.Var) {
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
        uir.visitAllExpressions(node, new PropagateNextContext(nextNextContext));
      }

      // This variable might reference other variables, and those references should not be counted
      // as usages anymore.
      uir.visitAllExpressions(node, new RemoveVarUsagesFromNode(node, usages));

      const prev = node.prev;
      list.remove(node);
      node = prev;
    }

    // Next, scan nodes from beginning to end. When a variable is encountered, see if:
    // 1) it has only one usage, and
    // 2) it's legal to inline the variable into the statement which uses it.
    node = list.head;
    while (node !== null) {
      if (node.kind !== uir.NodeKind.Var) {
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

      const [usage, usageCount]: [uir.Node, number] = usageMap.entries().next().value;
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
      uir.visitAllExpressions(usage, new InlineOneVariable(node.id, node.value));
      node = list.remove(node);
    }
  }
}

class VariableMapper extends ExpressionTransformer<uir.Node> {
  /**
   * Tracks the node in which each variable is used, or 'multiple' if more than one.
   */
  readonly usages = new Map<uir.VarId, Map<uir.Node, number>>();

  /**
   * Those nodes with expressions that contain hazards.
   */
  readonly hazards = new Set<uir.Node>();

  /**
   * Tracks the `NextContext` operation which follows any given `NextContext`.
   *
   * Gotta love the name.
   */
  readonly nextNextContext = new Map<uir.NextContextExpr, uir.NextContextExpr>();

  /**
   * Those nodes with expressions that cannot be inlined past hazards.
   */
  readonly sensitive = new Set<uir.Node>();

  /**
   * The last `NextContext` operation seen.
   *
   * Used in the construction of the `nextNextContext` map.
   */
  private prevNextContext: uir.NextContextExpr|null = null;

  visitEmbeddedExpression(expr: uir.EmbeddedExpression, node: uir.Node): uir.EmbeddedExpression {
    switch (expr.value.kind) {
      case uir.ExpressionKind.NextContext:
        this.hazards.add(node);

        // Populate `nextNextContext` if this isn't the first `NextContext` expression seen.
        if (this.prevNextContext !== null) {
          this.nextNextContext.set(this.prevNextContext, expr.value);
        }
        this.prevNextContext = expr.value;
        break;
      case uir.ExpressionKind.Reference:
        this.sensitive.add(node);
        break;
      case uir.ExpressionKind.Var:
        if (!this.usages.has(expr.value.id)) {
          this.usages.set(expr.value.id, new Map<uir.Node, number>());
        }
        const map = this.usages.get(expr.value.id)!;
        if (!map.has(node)) {
          map.set(node, 1);
        } else {
          map.set(node, map.get(node)! + 1);
        }
        break;
    }
    return expr;
  }
}

class PropagateNextContext extends ExpressionTransformer {
  constructor(private nextNextContext: Map<uir.NextContextExpr, uir.NextContextExpr>) {
    super();
  }

  visitEmbeddedExpression(expr: uir.EmbeddedExpression) {
    if (expr.value.kind === uir.ExpressionKind.NextContext &&
        this.nextNextContext.has(expr.value)) {
      const nextNextContextExpr = this.nextNextContext.get(expr.value)!;
      nextNextContextExpr.jump += expr.value.jump;
    }
    return expr;
  }
}

class RemoveVarUsagesFromNode extends ExpressionTransformer {
  constructor(private node: uir.Node, private usages: Map<uir.VarId, Map<uir.Node, number>>) {
    super();
  }

  visitEmbeddedExpression(expr: uir.EmbeddedExpression): uir.EmbeddedExpression {
    if (expr.value.kind === uir.ExpressionKind.Var) {
      this.usages.get(expr.value.id)!.delete(this.node);
    }
    return expr;
  }
}

class InlineOneVariable extends ExpressionTransformer {
  private inlined = false;
  constructor(private id: uir.VarId, private inlineExpr: o.Expression) {
    super();
  }

  visitEmbeddedExpression(expr: uir.EmbeddedExpression): o.Expression {
    if (expr.value.kind !== uir.ExpressionKind.Var || expr.value.id !== this.id) {
      return expr;
    }

    if (this.inlined === true) {
      throw new Error('AssertionError: found multiple instances of variable during inlining');
    }

    this.inlined = true;
    return this.inlineExpr;
  }
}
