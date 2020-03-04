import * as o from '../../../../output/output_ast';
import {RootTemplate, Scope, Target, TargetKind} from '../ir/api';
import * as cir from '../ir/create';
import * as uir from '../ir/update';
import {ExpressionTransformer} from '../util/expression_transformer';

import {BaseTemplateStage} from './base';

export class ResolverStage extends BaseTemplateStage<never, UpdateResolver> {
  protected makeCreateTransform(): null { return null; }

  protected makeUpdateTransform(
      root: RootTemplate, prev: UpdateResolver|null, tmplId: cir.CirId|null): UpdateResolver {
    let scope: Scope;
    if (prev !== null && tmplId !== null) {
      scope = prev.scope.getChild(tmplId);
    } else {
      scope = root.scope;
    }
    return new UpdateResolver(scope);
  }
}

class UpdateResolver implements uir.Transform {
  private visitor !: ExpressionResolver;
  private targetMap = new Map<Target, uir.VarId>();

  private varId = 0;

  constructor(readonly scope: Scope) {}

  private newVar(): uir.VarId { return (this.varId++ as uir.VarId); }

  visitList(list: uir.List): void {
    let thisContext: o.Expression = new o.ReadVarExpr('ctx');
    let rootContext = thisContext;

    const init = new uir.List();
    let scope: Scope|null;
    for (scope = this.scope; scope !== null; scope = scope.parent) {
      if (scope !== this.scope) {
        // Allocate a variable for the context.
        const id = this.newVar();
        init.append({
          ...FRESH_NODE,
          kind: uir.NodeKind.Var, id,
          name: null,
          value: new uir.EmbeddedExpression({
            kind: uir.ExpressionKind.NextContext,
            jump: 1,
          })
        });
        thisContext = new uir.EmbeddedExpression({kind: uir.ExpressionKind.Var, id});
      }

      rootContext = thisContext;

      this.addEntriesOfScope(init, scope, thisContext);
    }

    list.prependList(init);

    this.visitor = new ExpressionResolver(this.scope, rootContext, this.targetMap);
  }

  visit(node: uir.Node): uir.Node {
    uir.visitAllExpressions(node, this.visitor);
    return node;
  }

  private addEntriesOfScope(init: uir.List, scope: Scope, ctx: o.Expression): void {
    for (const [name, target] of scope.targets) {
      let value: o.Expression;
      switch (target.kind) {
        case TargetKind.Reference:
          value = new uir.EmbeddedExpression({
            kind: uir.ExpressionKind.Reference,
            id: target.element,
            value: target.value,
            slot: null,
          });
          break;
        case TargetKind.Variable:
          value = new o.ReadPropExpr(ctx, target.value !== '' ? target.value : '$implicit');
          break;
        default:
          throw new Error('unsupported');
      }

      const varId = this.newVar();
      init.append({
        ...FRESH_NODE,
        kind: uir.NodeKind.Var,
        id: varId,
        name: null, value,
      });
      this.targetMap.set(target, varId);
    }
  }
}

export class ExpressionResolver extends ExpressionTransformer {
  constructor(
      private scope: Scope, private rootContext: o.Expression,
      private targetVars: Map<Target, uir.VarId>) {
    super();
  }

  visitEmbeddedExpression(expr: uir.EmbeddedExpression): o.Expression {
    if (expr.value.kind === uir.ExpressionKind.Unresolved) {
      const target = this.scope.lookup(expr.value.name);
      switch (target.kind) {
        case TargetKind.RootContext:
          return new o.ReadPropExpr(this.rootContext, expr.value.name);
        case TargetKind.Reference:
        case TargetKind.Variable:
          if (!this.targetVars.has(target)) {
            throw new Error('unknown reference/variable');
          }
          const refVar = this.targetVars.get(target) !;
          return new uir.EmbeddedExpression({
            kind: uir.ExpressionKind.Var,
            id: refVar,
          });
        default:
          throw new Error('unsupported');
      }
    }
    return expr;
  }
}

const FRESH_NODE = {
  next: null,
  prev: null,
}
