import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';
import {NextContextExpr} from '../embedded_views/next_context';
import {ReferenceExpr} from '../reference';
import {Var, VarId} from '../tmp_variables';
import {VarExpr} from '../tmp_variables/expression';

import {UnresolvedExpr} from './expressions';

interface LookupHost {
  lookup(name: string): ir.Target;
}

export class ResolverStage extends ir.BaseTemplateStage<never, UpdateResolver> {
  protected makeCreateTransform(): null {
    return null;
  }

  protected makeUpdateTransform(
      root: ir.RootTemplate, prev: UpdateResolver|null,
      template: ir.TemplateAspectWithId|null): UpdateResolver {
    let scope: ir.Scope;
    if (prev !== null && template !== null) {
      scope = prev.scope.getChild(template.id);
    } else {
      scope = root.scope;
    }
    return new UpdateResolver(scope);
  }
}

export class ResolverHostStage implements ir.HostStage {
  transform(host: ir.Host): void {
    host.create.applyTransform(new CreateHostResolver());
    host.update.applyTransform(new UpdateHostResolver());
  }
}

export class UpdateResolver implements ir.UpdateTransform {
  private visitor!: ExpressionResolver;
  private targetMap = new Map<ir.Target, VarId>();

  private varId = 0;

  constructor(readonly scope: ir.Scope) {}

  private newVar(): VarId {
    return (this.varId++ as VarId);
  }

  visitList(list: ir.UpdateList): void {
    let thisContext: o.Expression = new o.ReadVarExpr('ctx');
    let rootContext = thisContext;

    const init = new ir.UpdateList();
    let scope: ir.Scope|null;
    for (scope = this.scope; scope !== null; scope = scope.parent) {
      if (scope !== this.scope) {
        // Allocate a variable for the context.
        const id = this.newVar();
        init.append(new Var(id, new NextContextExpr(1)));
        thisContext = new VarExpr(id);
      }

      rootContext = thisContext;

      this.addEntriesOfScope(init, scope, thisContext);
    }

    list.prependList(init);

    this.visitor = new ExpressionResolver(this.scope, rootContext, this.targetMap);
  }

  visit(node: ir.UpdateNode): ir.UpdateNode {
    node.visitExpressions(this.visitor);
    return node;
  }

  private addEntriesOfScope(init: ir.UpdateList, scope: ir.Scope, ctx: o.Expression): void {
    for (const [name, target] of scope.targets) {
      let value: o.Expression;
      switch (target.kind) {
        case ir.TargetKind.Reference:
          value = new ReferenceExpr(target);
          break;
        case ir.TargetKind.Variable:
          value = new o.ReadPropExpr(ctx, target.value !== '' ? target.value : '$implicit');
          break;
        default:
          throw new Error('unsupported');
      }

      const varId = this.newVar();
      init.append(new Var(varId, value));
      this.targetMap.set(target, varId);
    }
  }
}

class HostLookupScope implements LookupHost {
  lookup(name: string): ir.Target {
    if (name === '$event') {
      return {kind: ir.TargetKind.Event};
    } else {
      return {kind: ir.TargetKind.RootContext};
    }
  }
}

class CreateHostResolver implements ir.CreateTransform {
  private visitor =
      new ExpressionResolver(new HostLookupScope(), o.variable('ctx'), new Map<ir.Target, VarId>());

  visit(node: ir.CreateNode): ir.CreateNode {
    node.visitExpressions(this.visitor);
    return node;
  }
}

class UpdateHostResolver implements ir.UpdateTransform {
  private visitor =
      new ExpressionResolver(new HostLookupScope(), o.variable('ctx'), new Map<ir.Target, VarId>());
  visit(node: ir.UpdateNode): ir.UpdateNode {
    node.visitExpressions(this.visitor);
    return node;
  }
}

export class ExpressionResolver extends ir.ExpressionTransformer {
  constructor(
      private scope: LookupHost, private rootContext: o.Expression,
      private targetVars: Map<ir.Target, VarId>) {
    super();
  }

  visitIrExpression(expr: ir.Expression): o.Expression {
    expr.visitChildren(this);

    if (expr instanceof UnresolvedExpr) {
      const target = this.scope.lookup(expr.name);
      switch (target.kind) {
        case ir.TargetKind.RootContext:
          return new o.ReadPropExpr(this.rootContext, expr.name);
        case ir.TargetKind.Reference:
        case ir.TargetKind.Variable:
          if (!this.targetVars.has(target)) {
            throw new Error('unknown reference/variable');
          }
          const refVar = this.targetVars.get(target)!;
          return new VarExpr(refVar);
        case ir.TargetKind.Event:
          return o.variable('$event');
        default:
          throw new Error('unsupported');
      }
    }
    return expr;
  }
}
