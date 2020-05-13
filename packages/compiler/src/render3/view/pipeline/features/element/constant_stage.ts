/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';

import {Element, ElementAttrs, ElementStart} from './node';

export class ElementConstsLiftingStage extends
    ir.BaseTemplateStage<ElementConstsLiftingTransform, never> {
  private instance: ElementConstsLiftingTransform|null = null;

  protected makeCreateTransform(root: ir.RootTemplate): ElementConstsLiftingTransform {
    if (this.instance === null) {
      this.instance = new ElementConstsLiftingTransform(root);
    }
    return this.instance;
  }

  protected makeUpdateTransform(): null {
    return null;
  }
}

export class ElementConstsLiftingTransform implements ir.CreateTransform {
  constructor(private root: ir.RootTemplate) {
    root.consts = [];
  }

  visit(node: ir.CreateNode): ir.CreateNode {
    if (!(node instanceof Element || node instanceof ElementStart)) {
      return node;
    }

    if (node.refs !== null && Array.isArray(node.refs)) {
      const refs: string[] = [];
      for (const ref of node.refs) {
        refs.push(ref.name);
        refs.push(ref.value);
      }

      node.refs = this.addOrDedupConst(new o.LiteralArrayExpr(toExpressions(refs)));
    }

    if (node.attrs !== null && Array.isArray(node.attrs)) {
      // Convert node.attrs to o.Expression.
      const attrs = new o.LiteralArrayExpr(toExpressions(node.attrs));

      node.attrs = this.addOrDedupConst(attrs);
    }

    return node;
  }

  private addOrDedupConst(value: o.Expression): number {
    for (let idx = 0; idx < this.root.consts!.length; idx++) {
      const existingConst = this.root.consts![idx];
      if (existingConst.isEquivalent(value)) {
        // Another constant is equivalent to this new one, so reuse the old index instead of
        // duplicating data in the `consts` array.
        return idx;
      }
    }

    const idx = this.root.consts!.length;
    this.root.consts!.push(value);
    return idx;
  }
}

export function toExpressions(attrs: ElementAttrs): o.Expression[] {
  return attrs.map(value => {
    if (Array.isArray(value)) {
      return new o.LiteralArrayExpr(value.map(v => o.literal(v)));
    } else {
      return o.literal(value);
    }
  });
}
