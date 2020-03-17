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
import {CreateEmitter} from '../api';

export class ElementEmitter implements CreateEmitter {
  emit(node: cir.Node): o.Statement|null {
    switch (node.kind) {
      // ɵɵelement()
      case cir.Kind.Element:
        return o.importExpr(R3.element).callFn(produceElementParams(node)).toStmt();

      // ɵɵelementStart()
      case cir.Kind.ElementStart:
        return o.importExpr(R3.elementStart).callFn(produceElementParams(node)).toStmt();

      // ɵɵelementEnd()
      case cir.Kind.ElementEnd:
        return o.importExpr(R3.elementEnd).callFn([]).toStmt();
    }

    return null;
  }
}

function slot(index: number) {
  return o.literal(index);
}

function produceElementParams(node: cir.Element | cir.ElementStart): o.Expression[] {
  const params = [
    slot(node.slot !),
    o.literal(node.tag),
  ];
  if (node.attrs !== null && typeof node.attrs === 'number') {
    params.push(o.literal(node.attrs));
  }
  return params;
}
