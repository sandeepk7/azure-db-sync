/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import {Expression} from '../../ir/expression';

import {VarId} from './node';

export class VarExpr extends Expression {
  readonly kind = 'VarExpr';

  name: string|null = null;

  constructor(readonly id: VarId) {
    super();
  }

  visitChildren(): void {}

  toFinalExpression(): o.Expression {
    if (this.name === null) {
      throw new Error(`VarExpr: variable ${this.id} has no name`);
    }
    return o.variable(this.name);
  }
}
