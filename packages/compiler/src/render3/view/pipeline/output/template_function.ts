/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as o from '../../../../output/output_ast';
import {CONTEXT_NAME, RENDER_FLAGS} from '../../util';
import * as cir from '../api/cir';
import * as uir from '../api/uir';
import * as core from '../../../../core';
import {Driver} from '../api/output';
import {ElementDriver} from '../output/drivers/element_output_driver';
import {TextOutputDriver} from '../output/drivers/text_output_driver';
import {UnsupportedOutputDriver} from '../output/drivers/unsupported_output_driver';
import {emitCreationNode, emitUpdateNode} from './util';


const DRIVERS: Driver[] = [
  new ElementDriver(),
  new TextOutputDriver(),
  new UnsupportedOutputDriver(),
];

export function emitTemplateFunction(
  creationList: cir.List | cir.Node[],
  updateList: uir.List | uir.Node[]) {

  return o.fn(produceTemplateFunctionParams(), produceBody(creationList, updateList, DRIVERS));
}

function produceBody(creationList: cir.List | cir.Node[], updateList: uir.List | uir.Node[], drivers: Driver[]): o.Statement[] {
  const stmts: o.Statement[] = [];
  const creationStmts = produceCreationInstructions(creationList, drivers);
  if (creationStmts.length) {
    // if (rf & CREATE) { ... }
    stmts.push(ifRenderStmt(true, creationStmts));
  }

  const updateStmts = produceUpdateInstructions(updateList, drivers);
  if (updateStmts.length) {
    // if (rf & UPDATE) { ... }
    stmts.push(ifRenderStmt(false, updateStmts));
  }

  return stmts;
}

function ifRenderStmt(creationMode: boolean, thenStmts: o.Statement[]) {
  const renderFlag = creationMode ? core.RenderFlags.Create : core.RenderFlags.Update;
  const precondition = o.variable(RENDER_FLAGS).and(o.literal(renderFlag));
  return o.ifStmt(precondition, thenStmts);
}

function produceCreationInstructions(list: cir.List | cir.Node[], drivers: Driver[]) {
  const stmts: o.Statement[] = [];
  list.forEach(node => {
    const result = emitCreationNode(node, drivers);
    if (result) {
      stmts.push(result);
    }
  });
  return stmts;
}

function produceUpdateInstructions(list: uir.List | uir.Node[], drivers: Driver[]) {
  const stmts: o.Statement[] = [];
  list.forEach(node => {
    const result = emitUpdateNode(node, drivers);
    if (result) {
      stmts.push(result);
    }
  });
  return stmts;
}

function produceTemplateFunctionParams(): o.FnParam[] {
  return [
    // i.e. (rf: RenderFlags, ctx: any)
    new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE),
    new o.FnParam(CONTEXT_NAME, null),
  ];
}
