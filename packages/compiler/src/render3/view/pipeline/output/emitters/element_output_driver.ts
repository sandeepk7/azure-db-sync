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
  const p0 = slot(node.slot !);
  const p1 = o.literal(node.tag);
  let p2: o.Expression = o.NULL_EXPR;
  let p3: o.Expression = o.NULL_EXPR;
  if (node.attrs !== null && typeof node.attrs === 'number') {
    p2 = o.literal(node.attrs);
  }
  if (node.refs !== null && typeof node.refs === 'number') {
    p3 = o.literal(node.refs);
  }

  if (p3 !== o.NULL_EXPR) {
    return [p0, p1, p2, p3];
  } else if (p2 !== o.NULL_EXPR) {
    return [p0, p1, p2];
  } else {
    return [p0, p1];
  }
}
