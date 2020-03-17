/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as core from '../../../../core';
import * as o from '../../../../output/output_ast';
import {CONTEXT_NAME, RENDER_FLAGS} from '../../util';
import {RootTemplate} from '../ir/api';
import * as cir from '../ir/create';
import * as uir from '../ir/update';
import {LinkedList, LinkedListNode} from '../linked_list';
import {CreateEmitter, Emitter, UpdateEmitter} from '../output/api';

export function emitNode<T extends LinkedListNode<T>>(node: T, emitters: Emitter<T>[]): o.Statement|
    null {
  for (let i = 0; i < emitters.length; i++) {
    const result = emitters[i].emit(node);
    if (result) {
      return result;
    }
  }
  return null;
}

export function produceBodyStatements(
    tpl: RootTemplate | cir.Template, createEmitters: CreateEmitter[],
    updateEmitters: UpdateEmitter[]): o.Statement[] {
  const stmts: o.Statement[] = [];
  const creationStmts = produceInstructions<cir.Node>(tpl.create, createEmitters);
  if (creationStmts.length) {
    // if (rf & CREATE) { ... }
    stmts.push(ifRenderStmt(true, creationStmts));
  }

  const updateStmts = produceInstructions<uir.Node>(tpl.update, updateEmitters);
  if (updateStmts.length) {
    // if (rf & UPDATE) { ... }
    stmts.push(ifRenderStmt(false, updateStmts));
  }

  return stmts;
}

export function ifRenderStmt(creationMode: boolean, thenStmts: o.Statement[]) {
  const renderFlag = creationMode ? core.RenderFlags.Create : core.RenderFlags.Update;
  const precondition = o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(renderFlag));
  return o.ifStmt(precondition, thenStmts);
}

export function produceInstructions<T extends LinkedListNode<T>>(
    list: LinkedList<T>, emitters: Emitter<T>[]) {
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
