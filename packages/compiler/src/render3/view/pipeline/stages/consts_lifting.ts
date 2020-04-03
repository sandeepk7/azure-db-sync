import * as o from '../../../../output/output_ast';
import {RootTemplate} from '../ir/api';
import * as cir from '../ir/create';

import {BaseTemplateStage, CreateOnlyTemplateStage} from './base';

export class ElementConstsLiftingStage extends
    BaseTemplateStage<ElementConstsLiftingTransform, never> {
  private instance: ElementConstsLiftingTransform|null = null;

  protected makeCreateTransform(root: RootTemplate): ElementConstsLiftingTransform {
    if (this.instance === null) {
      this.instance = new ElementConstsLiftingTransform(root);
    }
    return this.instance;
  }

  protected makeUpdateTransform(): null { return null; }
}

export class ElementConstsLiftingTransform implements cir.Transform {
  constructor(private root: RootTemplate) { root.consts = []; }

  visit(node: cir.Node): cir.Node {
    if (node.kind !== cir.Kind.Element && node.kind !== cir.Kind.ElementStart) {
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
    for (let idx = 0; idx < this.root.consts !.length; idx++) {
      const existingConst = this.root.consts ![idx];
      if (existingConst.isEquivalent(value)) {
        // Another constant is equivalent to this new one, so reuse the old index instead of
        // duplicating data in the `consts` array.
        return idx;
      }
    }

    const idx = this.root.consts !.length;
    this.root.consts !.push(value);
    return idx;
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
