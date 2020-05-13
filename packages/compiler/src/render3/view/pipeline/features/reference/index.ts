import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as ir from '../../ir';

export class ReferenceExpr extends ir.Expression {
  readonly kind = 'ReferenceExpr';

  constructor(public ref: ir.Reference) {
    super();
  }

  visitChildren(): void {}

  toFinalExpression(): o.Expression {
    if (this.ref.slot === null) {
      throw new Error('AssertionError: slot should have been allocated');
    }
    return new o.ExternalExpr(R3.reference).callFn([o.literal(this.ref.slot)]);
  }
}
