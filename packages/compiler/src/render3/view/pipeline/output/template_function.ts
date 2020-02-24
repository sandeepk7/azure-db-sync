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
import {CreateEmitter, UpdateEmitter, Emitter} from '../api/output';
import {ElementEmitter} from './emitters/element_output_driver';
import {TextOutputEmitter} from './emitters/text_output_driver';
import {UnsupportedCreateEmitter} from './emitters/unsupported_output_driver';
import {emitNode} from './util';

const CREATE_EMITTERS: CreateEmitter[] = [
  new ElementEmitter(),
  new TextOutputEmitter(),
  new UnsupportedCreateEmitter(),
];

const UPDATE_EMITTERS: UpdateEmitter[] = [
];

export function emitTemplateFunction(
  createList: cir.List | cir.Node[],
  updateList: uir.List | uir.Node[]) {

  const create = Array.isArray(createList) ? createList : createList.toArray();
  const update = Array.isArray(updateList) ? updateList : updateList.toArray();

  return o.fn(
    produceTemplateFunctionParams(),
    produceBodyStatements(create, CREATE_EMITTERS, update, UPDATE_EMITTERS));
}

export function produceBodyStatements(createList: cir.Node[],
                     createEmitters: CreateEmitter[],
                     updateList: uir.Node[],
                     updateEmitters: UpdateEmitter[]): o.Statement[] {
  const stmts: o.Statement[] = [];
  const creationStmts = produceInstructions<cir.Node>(createList, createEmitters);
  if (creationStmts.length) {
    // if (rf & CREATE) { ... }
    stmts.push(ifRenderStmt(true, creationStmts));
  }

  const updateStmts = produceInstructions<uir.Node>(updateList, updateEmitters);
  if (updateStmts.length) {
    // if (rf & UPDATE) { ... }
    stmts.push(ifRenderStmt(false, updateStmts));
  }

  return stmts;
}

export function ifRenderStmt(creationMode: boolean, thenStmts: o.Statement[]) {
  const renderFlag = creationMode ? core.RenderFlags.Create : core.RenderFlags.Update;
  const precondition = o.variable(RENDER_FLAGS).and(o.literal(renderFlag));
  return o.ifStmt(precondition, thenStmts);
}

export function produceInstructions<T>(list: T[], emitters: Emitter<T>[]) {
  const stmts: o.Statement[] = [];
  list.forEach(node => {
    const result = emitNode(node, emitters);
    if (result) {
      stmts.push(result);
    }
  });
  return stmts;
}

export function produceTemplateFunctionParams(): o.FnParam[] {
  return [
    // i.e. (rf: RenderFlags, ctx: any)
    new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE),
    new o.FnParam(CONTEXT_NAME, null),
  ];
}
