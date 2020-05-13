/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';

import {Property} from '../binding/property';
import {StyleMap, StyleProp} from './style';

export class StyleTemplateStage extends ir.BaseTemplateStage<never, StyleTransform> {
  private styleTransform = new StyleTransform();

  makeCreateTransform(): null {
    return null;
  }

  makeUpdateTransform(): StyleTransform {
    return this.styleTransform;
  }
}

export class StyleHostStage implements ir.HostStage {
  private styleTransform = new StyleTransform();

  transform(host: ir.Host): void {
    host.update.applyTransform(this.styleTransform);
  }
}

export class StyleTransform implements ir.UpdateTransform {
  visit(node: ir.UpdateNode): ir.UpdateNode {
    if (node instanceof Property && isStyleProp(node.name)) {
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
  const {prev, next, id, expression, slot} = node;
  const newNode = new StyleMap(id, expression).withPrevAndNext(prev, next);
  newNode.slot = slot;
  return newNode;
}

function convertStylePropProperty(node: Property): StyleProp {
  const {prev, next, id, expression, slot} = node;
  const {suffix, prop} = extractStylePropName(node.name);
  const newNode = new StyleProp(id, prop, suffix, expression).withPrevAndNext(prev, next);
  newNode.slot = slot;
  return newNode;
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
