import * as o from '../../../../output/output_ast';
import {RootTemplate} from '../ir/api';
import * as cir from '../ir/create';

import {BaseTemplateStage, CreateOnlyTemplateStage} from './base';

export class ElementAttrLiftingStage extends BaseTemplateStage<ElementAttrLiftingTransform, never> {
  private instance: ElementAttrLiftingTransform|null = null;

  protected makeCreateTransform(root: RootTemplate): ElementAttrLiftingTransform {
    if (this.instance === null) {
      this.instance = new ElementAttrLiftingTransform(root);
    }
    return this.instance;
  }

  protected makeUpdateTransform(): null { return null; }
}

export class ElementAttrLiftingTransform implements cir.Transform {
  constructor(private root: RootTemplate) { root.attrs = []; }

  visit(node: cir.Node): cir.Node {
    if (node.kind !== cir.Kind.Element && node.kind !== cir.Kind.ElementStart) {
      return node;
    }

    if (node.attrs !== null && Array.isArray(node.attrs)) {
      // Convert node.attrs to o.Expression.
      const attrs = new o.LiteralArrayExpr(toExpressions(node.attrs));

      for (let idx = 0; idx < this.root.attrs !.length; idx++) {
        const existingAttrs = this.root.attrs ![idx];
        if (existingAttrs.isEquivalent(attrs)) {
          // Another element shares these same attributes, so reuse its index within the top-level
          // consts array instead of duplicating the attributes.
          node.attrs = idx;
          return node;
        }
      }

      // These attributes are unique, so they get their own index in the top-level array.
      const idx = this.root.attrs !.length;
      this.root.attrs !.push(attrs);
      node.attrs = idx;
    }

    return node;
  }
}

export function toExpressions(attrs: cir.ElementAttrs): o.Expression[] {
  return attrs.map(value => {
    if (Array.isArray(value)) {
      return new o.LiteralArrayExpr(value.map(v => o.literal(v)));
    } else {
      return o.literal(value);
    }
  });
}
