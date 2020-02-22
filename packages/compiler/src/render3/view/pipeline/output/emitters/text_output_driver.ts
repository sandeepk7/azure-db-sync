/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as cir from '../../ir/create';
import * as uir from '../../ir/update';
import {CreateEmitter} from '../../output/api';

export class TextOutputEmitter implements CreateEmitter {
  emit(node: cir.Node): o.Statement|null {
    switch (node.kind) {
      // ɵɵtext()
      case cir.Kind.Text:
        return o.importExpr(R3.text)
            .callFn([
              slot(node.slot !),
              o.literal(node.value),
            ])
            .toStmt();
    }

    return null;
  }

  emitUpdateInstruction(node: uir.Node): o.Statement|null { return null; }
}

function slot(index: number) {
  return o.literal(index);
}
