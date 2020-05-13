import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as ir from '../../ir';

export class Advance extends ir.UpdateNode {
  constructor(public delta: number) {
    super();
  }

  visitExpressions(): void {}
}

export class AdvanceEmitter implements ir.UpdateEmitter {
  emit(node: ir.UpdateNode): o.Statement|null {
    if (!(node instanceof Advance)) {
      return null;
    }

    return o.importExpr(R3.advance).callFn([o.literal(node.delta)]).toStmt();
  }
}
