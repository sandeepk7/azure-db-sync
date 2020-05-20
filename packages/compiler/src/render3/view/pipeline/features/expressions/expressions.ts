/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';

export class UnresolvedExpr extends ir.Expression {
  readonly kind = 'UnresolvedExpr';

  constructor(public name: string) {
    super();
  }

  visitChildren(): void {}

  toFinalExpression(): o.Expression {
    throw new Error(
        `Unresolved expression '${this.name}' should have been resolved prior to finalization.`)
  }
}
