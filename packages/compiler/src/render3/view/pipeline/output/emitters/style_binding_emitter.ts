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
import {UpdateEmitter} from '../api';

export class StyleBindingEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    switch (node.kind) {
      // ɵɵstyleProp()
      case uir.NodeKind.StyleProp:
        return o.importExpr(R3.styleProp)
            .callFn([
              o.literal(node.name),
              node.expression,
            ])
            .toStmt();

      // ɵɵstyleMap()
      case uir.NodeKind.StyleMap:
        return o.importExpr(R3.styleMap)
            .callFn([
              node.expression,
            ])
            .toStmt();
    }

    return null;
  }
}
