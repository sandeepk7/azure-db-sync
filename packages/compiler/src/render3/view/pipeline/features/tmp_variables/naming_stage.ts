import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';

import {VarExpr} from './expression';
import {Var, VarId} from './node';

export class VarNamesStage extends ir.UpdateOnlyTemplateStage implements ir.UpdateTransform {
  private nextId = 0;
  private nameMap = new Map<VarId, string>();
  private visitor = new VarNamesVisitor(this.nameMap);

  visit(node: ir.UpdateNode): ir.UpdateNode {
    if (!(node instanceof Var)) {
      return node;
    }
    const name = `t${this.nextId++}`;
    node.name = name;
    this.nameMap.set(node.id, name);
    node.visitExpressions(this.visitor);
    return node;
  }
}

class VarNamesVisitor extends ir.ExpressionTransformer {
  constructor(private nameMap: Map<VarId, string>) {
    super();
  }

  visitIrExpression(node: ir.Expression): o.Expression {
    node.visitChildren(this);
    if (!(node instanceof VarExpr)) {
      return node;
    }
    if (!this.nameMap.has(node.id)) {
      throw new Error(`Unnamed/unknown variable: ${node.id}`);
    }
    node.name = this.nameMap.get(node.id)!;
    return node;
  }
}
