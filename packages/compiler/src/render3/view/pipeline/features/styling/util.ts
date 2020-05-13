import * as o from '../../../../../output/output_ast';
import {InterpolationExpr} from '../binding/interpolation';

export function countBindings(expr: o.Expression): number {
  if (expr instanceof InterpolationExpr) {
    return 1 + expr.expressions.length;
  } else {
    return 2;
  }
}
