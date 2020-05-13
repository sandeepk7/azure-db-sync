import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as ir from '../../ir';

export class NextContextExpr extends ir.Expression {
  readonly kind = 'NextContextExpr';

  constructor(public jump: number) {
    super();
  }

  visitChildren(): void {}

  toFinalExpression(): o.Expression {
    if (this.jump === 1) {
      return o.importExpr(R3.nextContext).callFn([]);
    } else {
      return o.importExpr(R3.nextContext).callFn([o.literal(this.jump)]);
    }
  }
}
