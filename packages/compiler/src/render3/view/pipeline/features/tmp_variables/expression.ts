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
