import * as o from '../../../../output/output_ast';
import * as uir from '../ir/update';
import {ExpressionTransformer} from '../util/expression_transformer';
import {UpdateOnlyTemplateStage} from './base';

export class VarNamesStage extends UpdateOnlyTemplateStage implements uir.Transform {
  private nextId = 0;
  private nameMap = new Map<uir.VarId, string>();
  private visitor = new VarNamesVisitor(this.nameMap);

  visit(node: uir.Node): uir.Node {
    if (node.kind === uir.NodeKind.Var) {
      const name = `t${this.nextId++}`;
      node.name = name;
      this.nameMap.set(node.id, name);
    }
    uir.visitAllExpressions(node, this.visitor);
    return node;
  }
}

class VarNamesVisitor extends ExpressionTransformer {
  constructor(private nameMap: Map<uir.VarId, string>) {
    super();
  }

  visitEmbeddedExpression(node: uir.EmbeddedExpression, context: unknown): o.Expression {
    if (node.value.kind !== uir.ExpressionKind.Var) {
      return node;
    }
    if (!this.nameMap.has(node.value.id)) {
      throw new Error(`Unnamed/unknown variable: ${node.value.id}`);
    }
    return new o.ReadVarExpr(this.nameMap.get(node.value.id)!);
  }
}
