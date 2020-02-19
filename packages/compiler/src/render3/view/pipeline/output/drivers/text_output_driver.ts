/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as cir from '../../api/cir';
import * as uir from '../../api/uir';
import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import {Driver} from '../../api/output';

export class TextOutputDriver implements Driver {
  emitCreationInstruction(node: cir.Node): o.Statement|null {
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

  emitUpdateInstruction(node: uir.Node): o.Statement|null {
    return null;
  }
}

function slot(index: number) {
  return o.literal(index);
}
