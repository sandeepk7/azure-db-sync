import * as o from '../../../../output/output_ast';
import {Identifiers as R3Identifiers} from '../../../r3_identifiers';
import * as uir from '../ir/update';

import {ExpressionOnlyTemplateStage} from './base';

export class ExpressionTranslator extends ExpressionOnlyTemplateStage {
  visitEmbeddedExpression(expr: uir.EmbeddedExpression): o.Expression {
    switch (expr.value.kind) {
      case uir.ExpressionKind.NextContext:
        const nextContext = new o.ExternalExpr(R3Identifiers.nextContext);
        if (expr.value.jump === 1) {
          return nextContext.callFn([]);
        } else {
          return nextContext.callFn([o.literal(expr.value.jump)]);
        }
      case uir.ExpressionKind.Reference:
        if (expr.value.slot === null) {
          throw new Error('AssertionError: slot should have been allocated');
        }
        return new o.ExternalExpr(R3Identifiers.reference).callFn([o.literal(expr.value.slot)]);
      default:
        throw new Error(`Unexpected EmbeddedExpression: ${uir.expressionToString(expr.value)}`);
    }
  }
}
