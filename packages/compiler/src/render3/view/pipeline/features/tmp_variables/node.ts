import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';

export type VarId = number&{__brand: 'uir.VarId'};

export class Var extends ir.UpdateNode {
  name: string|null = null;

  constructor(readonly id: VarId, public value: o.Expression) {
    super();
  }

  visitExpressions(visitor: o.ExpressionVisitor, ctx?: any): void {
    this.value.visitExpression(visitor, ctx);
  }
}

export class VarEmitter implements ir.UpdateEmitter {
  emit(node: ir.UpdateNode): o.Statement|null {
    if (!(node instanceof Var)) {
      return null;
    }
    if (node.name === null) {
      throw new Error(`Unsupported: unnamed variable ${node.id}`);
    }

    return o.variable(node.name).set(node.value).toConstDecl();
  }
}
