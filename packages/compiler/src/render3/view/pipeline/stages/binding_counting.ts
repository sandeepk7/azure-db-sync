/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../output/output_ast';
import {RootTemplate, TemplateStage} from '../ir/api';
import * as cir from '../ir/create';
import * as uir from '../ir/update';
import {visitAllExpressions} from '../ir/update';
import {ExpressionTransformer} from '../util/expression_transformer';

import {BaseTemplateStage, UpdateOnlyTemplateStage} from './base';

export class BindingCountingStage extends BaseTemplateStage<never, BindingCountingTransform> {
  makeCreateTransform(): null {
    return null;
  }
  makeUpdateTransform(
      root: RootTemplate, prev: BindingCountingTransform|null, childTemplate: cir.Template|null) {
    const template = childTemplate !== null ? childTemplate : root;
    return new BindingCountingTransform(template);
  }
}

export class BindingCountingTransform {
  private count = 0;

  private expressionCounter = new ExpressionBindingCounter();

  constructor(private template: RootTemplate|cir.Template) {}

  visit(node: uir.Node): uir.Node {
    switch (node.kind) {
      case uir.NodeKind.TextInterpolate:
        this.count += node.expression.length;
        break;
    }
    visitAllExpressions(node, this.expressionCounter);
    return node;
  }

  finalize(): void {
    this.template.vars = this.count + this.expressionCounter.count;
  }
}

export class ExpressionBindingCounter extends ExpressionTransformer {
  count: number = 0;

  visitEmbeddedExpression(expr: uir.EmbeddedExpression): o.Expression {
    switch (expr.value.kind) {
      case uir.ExpressionKind.PipeBind:
        this.count += 1;
        if (expr.value.args !== null) {
          this.count += expr.value.args.length;
        }
    }
    return expr;
  }
}
