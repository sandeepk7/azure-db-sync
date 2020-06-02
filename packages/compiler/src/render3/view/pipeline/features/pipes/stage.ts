/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';
import {PureFunctionExpr} from '../pure_functions';

import {PipeBindExpr, PipeBindVExpr} from './expression';
import {Pipe} from './node';

export class PipeStage implements ir.TemplateStage {
  transform(tmpl: ir.TemplateAspect): void {
    for (let node = tmpl.create.head; node !== null; node = node.next) {
      if (ir.hasTemplateAspect(node)) {
        this.transform(node);
      }
    }

    // Scan through the update section.
    for (let node = tmpl.update.head; node !== null; node = node.next) {
      const targetId: ir.Id|null = ir.hasSlotAspect(node) ? node.id : null;
      node.visitExpressions(new PipeCreationVisitor(tmpl, targetId));
    }
  }
}

class PipeCreationVisitor extends ir.ExpressionTransformer {
  constructor(private tmpl: ir.TemplateAspect, private targetId: ir.Id|null) {
    super();
  }

  visitIrExpression(node: ir.Expression): o.Expression {
    node.visitChildren(this);
    if (!(node instanceof PipeBindExpr)) {
      return node;
    }

    if (this.targetId !== null) {
      const transform = new InsertPipeAfterNodeTransform(this.targetId, node.id, node.name);
      this.tmpl.create.applyTransform(transform);
      if (transform.inserted === false) {
        throw new Error(
            `Unable to find corresponding CreateNode(${this.targetId}) for PipeBind(${node.id})`);
      }
    } else {
      this.tmpl.create.append(new Pipe(node.id, node.name));
    }

    if (node.requiresPipeBindV) {
      return node.asPipeBindVExpr();
    } else {
      return node;
    }
  }
}

class InsertPipeAfterNodeTransform implements ir.CreateTransform {
  inserted = false;

  constructor(readonly targetId: ir.Id, readonly pipeId: ir.Id, readonly name: string) {}

  visit(node: ir.CreateNode, list: ir.CreateList): ir.CreateNode {
    if (!this.inserted && ir.hasSlotAspect(node) && node.id === this.targetId) {
      // TODO(alxhub): insert Pipe after ElementEnd.
      list.insertAfter(node, new Pipe(this.pipeId, this.name));
      this.inserted = true;
    }
    return node;
  }
}

export class InvertPipeBindVBindingOffsetOrderStage extends ir.ExpressionOnlyTemplateStage {
  visitIrExpression(expr: ir.Expression): o.Expression {
    expr.visitChildren(this);
    if (!(expr instanceof PipeBindVExpr)) {
      return expr;
    }

    if (!(expr.arg instanceof PureFunctionExpr)) {
      throw new Error(
          `Cannot fix a PipeBindVExpr that hasn't been processed by the PureFunctionStage`);
    }
    if (expr.slotOffset === null || expr.arg.slotOffset === null) {
      throw new Error(
          `Cannot fix a PipeBindVExpr that hasn't been processed by the BindingCountingStage`);
    }

    const bindingOffset = expr.arg.slotOffset;

    expr.slotOffset = bindingOffset;
    expr.arg.slotOffset = bindingOffset + expr.countUpdateBindingsUsed();
    return expr;
  }
}
