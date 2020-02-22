import * as o from '../../../../../src/output/output_ast';
import * as cir from '../../../../../src/render3/view/pipeline/ir/create';
import * as uir from '../../../../../src/render3/view/pipeline/ir/update';

export class UpdateBuilder {
  private varId: number = 0;
  private list = new uir.List();

  private nextVar(): uir.VarId { return (this.varId++) as uir.VarId; }

  addVarNextContext(): uir.VarId {
    const id = this.nextVar();
    this.list.append({
      ...FRESH_NODE,
      kind: uir.NodeKind.Var, id,
      value: new uir.EmbeddedExpression({kind: uir.ExpressionKind.NextContext, jump: 1}),
      name: null,
    });
    return id;
  }

  addVarReference(target: number): uir.VarId {
    const id = this.nextVar();
    this.list.append({
      ...FRESH_NODE,
      kind: uir.NodeKind.Var, id,
      value: new uir.EmbeddedExpression(
          {kind: uir.ExpressionKind.Reference, id: target as cir.Id, value: '', slot: null}),
      name: null,
    });
    return id;
  }

  addVarExpression(expr: o.Expression): uir.VarId {
    const id = this.nextVar();
    this.list.append({
      ...FRESH_NODE,
      kind: uir.NodeKind.Var, id,
      value: expr,
      name: null,
    });
    return id;
  }

  varExpression(id: uir.VarId): uir.EmbeddedExpression {
    return new uir.EmbeddedExpression({kind: uir.ExpressionKind.Var, id});
  }

  addInterpolate(target: number, expressions: o.Expression[], text: string[]|null = null): void {
    if (text === null) {
      text = [...expressions.map(_ => ''), ''];
    } else if (text.length !== expressions.length + 1) {
      throw new Error(`Wrong lengths for text nodes`);
    }

    this.list.append({
      ...FRESH_NODE,
      kind: uir.NodeKind.TextInterpolate,
      id: target as cir.Id,
      expression: expressions, text,
    });
  }

  build(): uir.List { return this.list; }
}

const FRESH_NODE = {
  prev: null,
  next: null,
};