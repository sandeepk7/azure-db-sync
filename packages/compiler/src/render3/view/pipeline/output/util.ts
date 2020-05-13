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
import {Template} from '../features/embedded_views/node';
import * as ir from '../ir';
import {ChainingStatementList} from './chaining';

export function produceBodyStatements(
    tpl: ir.RootTemplate|Template|ir.Host, createEmitters: ir.CreateEmitter[],
    updateEmitters: ir.UpdateEmitter[]): o.Statement[] {
  const stmts: o.Statement[] = [];

  const creationBlock = new ChainingStatementList();
  for (let node = tpl.create.head; node !== null; node = node.next) {
    creationBlock.append(emitCreateNode(node, createEmitters));
  }
  if (creationBlock.statements.length > 0) {
    // if (rf & CREATE) { ... }
    stmts.push(ifModeStatement(core.RenderFlags.Create, creationBlock.statements));
  }

  const updateBlock = new ChainingStatementList();
  for (let node = tpl.update.head; node !== null; node = node.next) {
    updateBlock.append(emitUpdateNode(node, updateEmitters));
  }
  if (updateBlock.statements.length > 0) {
    // if (rf & UPDATE) { ... }
    stmts.push(ifModeStatement(core.RenderFlags.Update, updateBlock.statements));
  }

  return stmts;
}

export function ifModeStatement(mode: core.RenderFlags, thenStmts: o.Statement[]) {
  const precondition = o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(mode));
  return o.ifStmt(precondition, thenStmts);
}

function emitCreateNode(node: ir.CreateNode, emitters: ir.CreateEmitter[]): o.Statement {
  for (const emitter of emitters) {
    const res = emitter.emit(node);
    if (res !== null) {
      return res;
    }
  }
  throw new Error(`Unsupported create node: ${node.constructor.name}`);
}

function emitUpdateNode(node: ir.UpdateNode, emitters: ir.UpdateEmitter[]): o.Statement {
  for (const emitter of emitters) {
    const res = emitter.emit(node);
    if (res !== null) {
      return res;
    }
  }
  throw new Error(`Unsupported update node: ${node.constructor.name}`);
}

export function produceTemplateFunctionParams(): o.FnParam[] {
  return [
    // i.e. (rf: RenderFlags, ctx: any)
    new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE),
    new o.FnParam(CONTEXT_NAME, null),
  ];
}
