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

export class ClassBindingsEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    switch (node.kind) {
      // ɵɵclassProp()
      case uir.NodeKind.ClassProp:
        return o.importExpr(R3.classProp).callFn([
          o.literal(node.name),
          node.expression,
        ]).toStmt();

      // ɵɵclassMap()
      case uir.NodeKind.ClassMap:
        return o.importExpr(R3.classMap).callFn([
          node.expression,
        ]).toStmt();
    }

    return null;
  }
}
