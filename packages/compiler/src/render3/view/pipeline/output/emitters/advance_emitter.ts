/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as uir from '../../ir/update';
import {UpdateEmitter} from '../../output/api';

export class AdvanceEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    if (node.kind !== uir.NodeKind.Advance) {
      return null;
    }

    return o.importExpr(R3.advance).callFn([o.literal(node.delta)]).toStmt();
  }
}
