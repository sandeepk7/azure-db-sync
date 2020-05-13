/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';
import {Template} from '../embedded_views/node';

export class BindingCountingStage implements ir.TemplateStage {
  transform(tmpl: ir.RootTemplate): void {
    this.transformTemplate(tmpl);
  }

  private transformTemplate(tmpl: ir.TemplateAspect): void {
    for (let node = tmpl.create.head; node !== null; node = node.next) {
      if (ir.hasTemplateAspect(node)) {
        this.transformTemplate(node);
      }
    }

    // Count bindings.
    const bindingTransform = new BindingCountingTransform();
    tmpl.update.applyTransform(bindingTransform);

    const expressionTransform = new ExpressionSlotTransform(bindingTransform.count);
    tmpl.update.applyTransform(expressionTransform);

    tmpl.vars = bindingTransform.count + expressionTransform.count;
  }
}

export class BindingCountingHostStage implements ir.HostStage {
  transform(host: ir.Host): void {
    const bindingTransform = new BindingCountingTransform();
    host.update.applyTransform(bindingTransform);

    const expressionTransform = new ExpressionSlotTransform(bindingTransform.count);
    host.update.applyTransform(expressionTransform);

    host.vars = bindingTransform.count + expressionTransform.count;
  }
}

export class BindingCountingTransform implements ir.UpdateTransform {
  count = 0;
  visit(node: ir.UpdateNode): ir.UpdateNode {
    if (ir.hasBindingSlotAspect(node)) {
      this.count += node.countUpdateBindingsUsed();
    }
    return node;
  }
}

export class ExpressionSlotTransform extends ir.ExpressionTransformer implements
    ir.UpdateTransform {
  count: number = 0;

  constructor(private bindingOffset: number) {
    super();
  }

  visitIrExpression(expr: ir.Expression): o.Expression {
    expr.visitChildren(this);

    if (ir.hasBindingSlotAspect(expr)) {
      expr.slotOffset = this.bindingOffset + this.count;
      this.count += expr.countUpdateBindingsUsed();
    }
    return expr;
  }

  visit(node: ir.UpdateNode): ir.UpdateNode {
    node.visitExpressions(this);
    return node;
  }
}
