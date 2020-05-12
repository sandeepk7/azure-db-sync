/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../output/output_ast';
import {Host, HostStage, RootTemplate, TemplateStage} from '../ir/api';
import * as cir from '../ir/create';
import * as uir from '../ir/update';
import {visitAllExpressions} from '../ir/update';
import {ExpressionTransformer} from '../util/expression_transformer';

import {BaseTemplateStage} from './base';

export class BindingCountingStage implements TemplateStage {
  transform(tmpl: RootTemplate): void {
    this.transformTemplate(tmpl);
  }

  private transformTemplate(tmpl: RootTemplate|cir.Template): void {
    for (let node = tmpl.create.head; node !== null; node = node.next) {
      if (node.kind === cir.Kind.Template) {
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

export class BindingCountingHostStage implements HostStage {
  transform(host: Host): void {
    const bindingTransform = new BindingCountingTransform();
    host.update.applyTransform(bindingTransform);

    const expressionTransform = new ExpressionSlotTransform(bindingTransform.count);
    host.update.applyTransform(expressionTransform);

    host.vars = bindingTransform.count + expressionTransform.count;
  }
}

export class BindingCountingTransform implements uir.Transform {
  count = 0;

  visit(node: uir.Node): uir.Node {
    switch (node.kind) {
      case uir.NodeKind.TextInterpolate:
        this.count += node.expression.length;
        break;
      case uir.NodeKind.Property:
      case uir.NodeKind.Attribute:
        this.count += 1;
        break;
      case uir.NodeKind.ClassMap:
      case uir.NodeKind.StyleMap:
        this.count += 2;
        break;
      case uir.NodeKind.ClassProp:
      case uir.NodeKind.StyleProp:
        if (node.expression instanceof uir.EmbeddedExpression &&
            node.expression.value.kind === uir.ExpressionKind.Interpolation) {
          this.count += 1 + node.expression.value.expressions.length;
        } else {
          this.count += 2;
        }
        break;
    }
    return node;
  }
}

export class ExpressionSlotTransform extends ExpressionTransformer implements uir.Transform {
  count: number = 0;

  constructor(private bindingOffset: number) {
    super();
  }

  visitEmbeddedExpression(expr: uir.EmbeddedExpression): o.Expression {
    super.visitEmbeddedExpression(expr, /* ctx */ undefined);
    switch (expr.value.kind) {
      case uir.ExpressionKind.PipeBind:
      case uir.ExpressionKind.PureFunction:
        expr.value.slotOffset = this.bindingOffset + this.count;
        this.count += 1;
        if (expr.value.args !== null) {
          this.count += expr.value.args.length;
        }
        break;
    }
    return expr;
  }

  visit(node: uir.Node): uir.Node {
    uir.visitAllExpressions(node, this);
    return node;
  }
}
