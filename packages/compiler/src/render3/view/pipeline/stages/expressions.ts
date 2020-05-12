import * as o from '../../../../output/output_ast';
import {Identifiers as R3Identifiers} from '../../../r3_identifiers';
import * as uir from '../ir/update';

import {ExpressionOnlyTemplateStage} from './base';

const PURE_FUNCTION_INSTRUCTION = [
  R3Identifiers.pureFunction0,
  R3Identifiers.pureFunction1,
  R3Identifiers.pureFunction2,
  R3Identifiers.pureFunction3,
  R3Identifiers.pureFunction4,
  R3Identifiers.pureFunction5,
  R3Identifiers.pureFunction6,
  R3Identifiers.pureFunction7,
  R3Identifiers.pureFunction8,
];

export class ExpressionTranslatorStage extends ExpressionOnlyTemplateStage {
  visitEmbeddedExpression(expr: uir.EmbeddedExpression): o.Expression {
    super.visitEmbeddedExpression(expr, /* context */ undefined);
    switch (expr.value.kind) {
      case uir.ExpressionKind.NextContext:
        const nextContext = o.importExpr(R3Identifiers.nextContext);
        if (expr.value.jump === 1) {
          return nextContext.callFn([]);
        } else {
          return nextContext.callFn([o.literal(expr.value.jump)]);
        }
      case uir.ExpressionKind.Reference:
        if (expr.value.ref.slot === null) {
          throw new Error('AssertionError: slot should have been allocated');
        }
        return new o.ExternalExpr(R3Identifiers.reference).callFn([o.literal(expr.value.ref.slot)]);
      case uir.ExpressionKind.Interpolation:
        // Leave Interpolation expressions alone.
        return expr;
      case uir.ExpressionKind.PureFunction:
        if (expr.value.slotOffset === null) {
          throw new Error('AssertionError: slot offset should have been set for PureFunctionExpr');
        }
        const startingArgs = [o.literal(expr.value.slotOffset), expr.value.fn];
        if (expr.value.args.length < PURE_FUNCTION_INSTRUCTION.length) {
          return o.importExpr(PURE_FUNCTION_INSTRUCTION[expr.value.args.length]).callFn([
            ...startingArgs,
            ...expr.value.args,
          ]);
        } else {
          return o.importExpr(R3Identifiers.pureFunctionV).callFn([
            ...startingArgs,
            o.literalArr(expr.value.args),
          ]);
        }
      default:
        throw new Error(`Unexpected EmbeddedExpression: ${uir.expressionToString(expr.value)}`);
    }
  }
}
