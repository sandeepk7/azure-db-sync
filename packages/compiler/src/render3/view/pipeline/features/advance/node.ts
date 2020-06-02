/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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

    // if (node.delta === 1) {
    // return o.importExpr(R3.advance).callFn([]).toStmt();
    // } else {
    return o.importExpr(R3.advance).callFn([o.literal(node.delta)]).toStmt();
    // }
  }
}
