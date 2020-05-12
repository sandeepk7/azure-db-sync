import {ConstantPool} from '../../../../constant_pool';
import * as o from '../../../../output/output_ast';
import * as uir from '../ir/update';

import {ExpressionOnlyTemplateStage} from './base';

export class PureFunctionStage extends ExpressionOnlyTemplateStage {
  constructor(private constantPool: ConstantPool) {
    super();
  }

  visitLiteralArrayExpr(node: o.LiteralArrayExpr): o.Expression {
    let transformedNode =
        super.visitLiteralArrayExpr(node, /* ctx */ undefined) as o.LiteralArrayExpr;
    const {literalFactory: identifier, literalFactoryArguments: args} =
        this.constantPool.getLiteralFactory(transformedNode);
    return new uir.EmbeddedExpression(new uir.PureFunctionExpr(identifier, args))
  }

  visitLiteralMapExpr(node: o.LiteralMapExpr): o.Expression {
    let transformedNode = super.visitLiteralMapExpr(node, /* ctx */ undefined) as o.LiteralMapExpr;
    const {literalFactory: identifier, literalFactoryArguments: args} =
        this.constantPool.getLiteralFactory(transformedNode);
    return new uir.EmbeddedExpression(new uir.PureFunctionExpr(identifier, args))
  }
}
