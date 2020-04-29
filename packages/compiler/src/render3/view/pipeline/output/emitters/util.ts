/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as uir from '../../ir/update';
import * as o from '../../../../../output/output_ast';

export function emitInterpolationExpr(fn: InterpolationRefFn, expr: uir.InterpolationExpression) {
  const params = generateInterpolationParams(expr.expressions, expr.strings);
  const instruction = fn(params.length);
  return o.importExpr(instruction).callFn(params).toStmt();
}

export function generateInterpolationParams(expressions: o.Expression[], strings: string[]): o.Expression[] {
  const params: o.Expression[] = [];
  for (let i = 0; i < expressions.length; i++) {
    params.push(o.literal(strings[i]));
    params.push(expressions[i]);
  }
  if (strings[expressions.length] !== undefined) {
    params.push(o.literal(strings[expressions.length]));
  }
  return params;
}

export interface InterpolationRefFn {
  (expressionLength: number): o.ExternalReference;
}
