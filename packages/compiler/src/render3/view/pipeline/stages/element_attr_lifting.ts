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
      const idx = this.root.attrs !.length;
      // Convert node.attrs to o.Expression.
      const attrs = toExpressions(node.attrs);
      this.root.attrs !.push(new o.LiteralArrayExpr(attrs));
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