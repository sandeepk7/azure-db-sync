/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker} from '../../../../../core';
import * as ir from '../../ir';
import {Property} from '../binding/property';
import {ElementAttrs, ElementBase, Selector} from '../element';
import {filterAttrs} from '../element/util';

import {StyleMap, StyleProp} from './style';

export class StyleTemplateStage extends
    ir.BaseTemplateStage<StyleAttrsTransform, StyleBindingsTransform> {
  private styleBindingsTransform = new StyleBindingsTransform();
  private styleAttrsTransform = new StyleAttrsTransform();

  makeCreateTransform(): StyleAttrsTransform {
    return this.styleAttrsTransform;
  }

  makeUpdateTransform(): StyleBindingsTransform {
    return this.styleBindingsTransform;
  }
}

export class StyleHostStage implements ir.HostStage {
  private styleTransform = new StyleBindingsTransform();

  transform(host: ir.Host): void {
    host.update.applyTransform(this.styleTransform);
  }
}

export class StyleAttrsTransform implements ir.CreateTransform {
  visit(node: ir.CreateNode): ir.CreateNode {
    if (node instanceof ElementBase && Array.isArray(node.attrs)) {
      node.attrs = deleteStyleAttributes(node.attrs);
    }
    return node;
  }
}

export class StyleBindingsTransform implements ir.UpdateTransform {
  visit(node: ir.UpdateNode): ir.UpdateNode {
    if (node instanceof Property && isStyleProp(node.name)) {
      node = convertStyleProperty(node);
    }
    return node;
  }
}

function deleteStyleAttributes(attrs: ElementAttrs) {
  attrs = filterAttrs(attrs, (marker: AttributeMarker, binding: string|number|Selector) => {
    return marker !== AttributeMarker.Bindings || !isStyleProp(binding as string);
  });

  // the reason why we return `null` is because if the array is
  // fully empty then there are no constants to assign to the
  // element creation.
  return attrs.length === 0 ? null : attrs;
}

function isStyleProp(name: string): boolean {
  return name === 'style' || name.substring(0, 6) === 'style.';
}

function convertStyleProperty(node: Property): StyleMap|StyleProp {
  return node.name === 'style' ? convertStyleMapProperty(node) : convertStylePropProperty(node);
}

function convertStyleMapProperty(node: Property): StyleMap {
  const {prev, next, id, expression, slot} = node;
  const newNode = new StyleMap(id, expression, node.sourceSpan).withPrevAndNext(prev, next);
  newNode.slot = slot;
  return newNode;
}

function convertStylePropProperty(node: Property): StyleProp {
  const {prev, next, id, expression, slot} = node;
  const {suffix, prop} = extractStylePropName(node.name);
  const newNode =
      new StyleProp(id, prop, suffix, expression, node.sourceSpan).withPrevAndNext(prev, next);
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
