/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Host, HostStage} from '../ir/api';
import {List, Node, NodeKind, Property, StyleMap, StyleProp, Transform} from '../ir/update';

import {BaseTemplateStage} from './base';

export class StyleTemplateStage extends BaseTemplateStage<never, StyleTransform> {
  private styleTransform = new StyleTransform();

  makeCreateTransform(): null {
    return null;
  }

  makeUpdateTransform(): StyleTransform {
    return this.styleTransform;
  }
}

export class StyleHostStage implements HostStage {
  private styleTransform = new StyleTransform();

  transform(host: Host): void {
    host.update.applyTransform(this.styleTransform);
  }
}

export class StyleTransform implements Transform {
  visit(node: Node, list: List): Node {
    if (node.kind === NodeKind.Property && isStyleProp(node.name)) {
      node = convertStyleProperty(node);
    }
    return node;
  }
}

function isStyleProp(name: string): boolean {
  return name === 'style' || name.substring(0, 6) === 'style.';
}

function convertStyleProperty(node: Property): StyleMap|StyleProp {
  return node.name === 'style' ? convertStyleMapProperty(node) : convertStylePropProperty(node);
}

function convertStyleMapProperty(node: Property): StyleMap {
  const {prev, next, id, expression} = node;
  return {kind: NodeKind.StyleMap, id, expression, next, prev};
}

function convertStylePropProperty(node: Property): StyleProp {
  const {prev, next, id, expression} = node;
  const {suffix, prop} = extractStylePropName(node.name);
  return {kind: NodeKind.StyleProp, id, name: prop, expression, suffix, next, prev};
}

function extractStylePropName(name: string): {prop: string, suffix: string|null} {
  const captures = name.match(/style.(\w+)(?:\.([a-zA-Z]+))?/);
  if (captures === null) {
    throw new Error(`Invalid [style.prop] binding syntax`);
  }

  const prop = captures[1];
  const suffix = captures[2] !== undefined ? captures[2] : null;
  return {prop, suffix};
}
