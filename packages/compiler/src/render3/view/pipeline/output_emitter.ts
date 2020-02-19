/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as o from '../../../output/output_ast';
import {Identifiers as R3} from '../../r3_identifiers';
import {CONTEXT_NAME, RENDER_FLAGS} from '../util';

import * as cir from './api/cir';

export function emitTemplateFunction(creationList: cir.List | cir.Node[]) {
  return o.fn(produceTemplateFunctionParams(), produceBody(creationList), );
}

function produceBody(nodes: cir.List | cir.Node[]): o.Statement[] {
  const stmts: o.Statement[] = [];
  nodes.forEach(node => { stmts.push(convertNodeToOutputStmt(node)); });
  return stmts;
}

function convertNodeToOutputStmt(node: cir.Node): o.Statement {
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

    // ɵɵtext()
    case cir.Kind.Text:
      return o.importExpr(R3.text)
          .callFn([
            slot(node.slot !),
            o.literal(node.value),
          ])
          .toStmt();

    default:
      throw new Error(`Unsupported node kind: ${node.kind}`);
  }
}

function slot(index: number) {
  return o.literal(index);
}

function produceElementParams(node: cir.Element | cir.ElementStart): o.Expression[] {
  return [
    slot(node.slot !),
    o.literal(node.tag),
    produceElementAttrs(node.attrs),
  ];
}

function produceElementAttrs(attrs: any[] | number | null) {
  if (attrs === null) return o.NULL_EXPR;
  if (typeof attrs === 'number') return o.literal(attrs);
  return o.literalArr(attrs.map(a => o.literal(a)));
}

function produceTemplateFunctionParams(): o.FnParam[] {
  return [
    // i.e. (rf: RenderFlags, ctx: any)
    new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE),
    new o.FnParam(CONTEXT_NAME, null),
  ];
}
