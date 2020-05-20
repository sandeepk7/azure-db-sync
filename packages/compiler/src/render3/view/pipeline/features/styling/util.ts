/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import {InterpolationExpr} from '../binding/interpolation';

export function countBindings(expr: o.Expression): number {
  if (expr instanceof InterpolationExpr) {
    return 1 + expr.expressions.length;
  } else {
    return 2;
  }
}
