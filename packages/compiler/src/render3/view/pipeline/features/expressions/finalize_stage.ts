import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';

export class ExpressionTranslatorStage extends ir.ExpressionOnlyTemplateStage {
  visitIrExpression(expr: ir.Expression): o.Expression {
    expr.visitChildren(this);
    return expr.toFinalExpression();
  }
}
