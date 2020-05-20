/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';

export class ExpressionTranslatorStage extends ir.ExpressionOnlyTemplateStage {
  visitIrExpression(expr: ir.Expression): o.Expression {
    expr.visitChildren(this);
    return expr.toFinalExpression();
  }
}
