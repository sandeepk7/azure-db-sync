/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {AttributeMarker, SelectorFlags} from '../../../../core';
import {splitNsName} from '../../../../ml_parser/tags';
import {parse as parseStyle} from '../../style_parser';
import * as cir from '../ir/create';
import {CreateOnlyTemplateStage} from './base';


/**
 * Converts empty elementStart/elementEnd instructions into element instruction
 */
export class ElementAttrsTransform extends CreateOnlyTemplateStage {
  visit(node: cir.Node, list: cir.List): cir.Node {
    switch (node.kind) {
      case cir.Kind.Element:
      case cir.Kind.ElementStart:
        if (node.attrs !== null && typeof node.attrs !== 'number') {
          node.attrs = transformAttrs(node.attrs);
        }
        break;
    }
    return node;
  }
}

function transformAttrs(attrs: cir.ElementAttrs) {
  const builder = new StaticAttributesBuilder();

  for (let i = 0; i < attrs.length; i += 2) {
    const prop = attrs[i] as string;
    const value = attrs[i + 1];
    switch (prop) {
      case 'class':
        if (value !== null && typeof value === 'string') {
          builder.setClassAttribute(value);
        }
        break;
      case 'style':
        if (value !== null && typeof value === 'string') {
          builder.setStyleAttribute(value);
        }
        break;
      default:
        if (value !== null && typeof value === 'string') {
          builder.setAttribute(prop, value);
        }
        break;
    }
  }

  return builder.build();
}

/**
 * Used to generate the `TAttributes` array (which is used by the `element`, `elementStart` and
 * `elementHostAttrs` instructions).
 */
export class StaticAttributesBuilder {
  private _keyValueAttrs: KeyValueEntry[]|null = null;
  private _classAttr: string|null = null;
  private _stylesAttr: string|null = null;
  private _templateNameAttrs: string[]|null = null;
  private _bindingNameAttrs: string[]|null = null;
  private _projectAsSelectors: (string|number)[]|null = null;
  private _i18nNameAttrs: string[]|null = null;

  setAttribute(attrName: string, value: string) {
    if (this._keyValueAttrs === null) {
      this._keyValueAttrs = [];
    }

    if (keyValueAttrsIndexOf(this._keyValueAttrs, attrName) === -1) {
      const [ns, nsAttr] = splitNsName(attrName);
      const prop = ns !== null ? {namespace: ns, attr: nsAttr, fullName: attrName} : attrName;
      this._keyValueAttrs.push({prop, value});
    }
  }

  setClassAttribute(value: string) {
    value = value.trim();
    this._classAttr = value.length === 0 ? null : value;
  }

  setStyleAttribute(value: string) {
    value = value.trim();
    this._stylesAttr = value.length === 0 ? null : value;
  }

  registerTemplateName(value: string) {
    if (!this._templateNameAttrs) {
      this._templateNameAttrs = [];
    }
    if (this._templateNameAttrs.indexOf(value) === -1) {
      this._templateNameAttrs.push(value);
    }
  }

  registerBindingName(value: string) {
    if (!this._bindingNameAttrs) {
      this._bindingNameAttrs = [];
    }
    if (this._bindingNameAttrs.indexOf(value) === -1) {
      this._bindingNameAttrs.push(value);
    }
  }

  registerI18nName(value: string) {
    if (!this._i18nNameAttrs) {
      this._i18nNameAttrs = [];
    }
    this._i18nNameAttrs.push(value);
  }

  setProjectAsSelector(selector: string|(string|SelectorFlags)[]) {
    this._projectAsSelectors = Array.isArray(selector) ? selector : [selector];
  }

  /**
   * Generates an array of each attribute registered in this class.
   *
   * The output format looks like this:
   *
   * ```typescript
   * [
   *   prop, value, prop2, value2, NAMESPACE_URI, ns, attr, value
   *   CLASSES, class1, class2,
   *   STYLES, style1, value1, style2, value2,
   *   BINDINGS, name1, name2, name3,
   *   TEMPLATE, name4, name5, name6,
   *   PROJECT_AS, selector,
   *   I18N, name7, name8
   * ]
   * ```
   */
  build(): cir.ElementAttrs {
    let attrs: cir.ElementAttrs = [];

    // ... 'prop', 'value', 'prop', NAMESPACE_URI, 'ns', 'prop', 'value' ...
    if (this._keyValueAttrs !== null) {
      populateKeyValueEntries(attrs, this._keyValueAttrs);
    }

    // ... CLASSES, 'foo', 'bar', 'baz' ...
    if (this._classAttr !== null) {
      populateClassAttributeEntries(attrs, this._classAttr);
    }

    // ... STYLES, 'width', '200px', 'height', '100px', ...
    if (this._stylesAttr !== null) {
      populateStyleAttributeEntries(attrs, this._stylesAttr);
    }

    // ... BINDINGS, 'name1', 'name2', 'name3' ...
    if (this._bindingNameAttrs !== null) {
      populateBindingNameEntries(attrs, this._bindingNameAttrs);
    }

    // ... TEMPLATE, 'name1', 'name2', 'name3' ...
    if (this._templateNameAttrs !== null) {
      populateTemplateNameEntries(attrs, this._templateNameAttrs);
    }

    // ... PROJECT_AS, ['s1', 's2', 's3', ... ] ...
    if (this._projectAsSelectors !== null) {
      populateProjectAsSelectors(attrs, this._projectAsSelectors);
    }

    // ... I18N, 'name1', 'name2', 'name3' ...
    if (this._i18nNameAttrs !== null) {
      populateI18nNameEntries(attrs, this._i18nNameAttrs);
    }

    return attrs;
  }
}

/**
 * Prop entry within `KeyValueEntry` for namespaced properties
 */
interface NamespacedPropEntry {
  namespace: string;
  attr: string;
  fullName: string;
}

/**
 * Key/value entry for key/value attributes added to the `StaticAttributesBuilder`
 */
interface KeyValueEntry {
  prop: string|NamespacedPropEntry;
  value: string;
}

function generateClassesArray(classAttr: string): string[] {
  return classAttr.split(/\s+/);
}

function generateStylePropAndValuesArray(stylesAttr: string): string[] {
  return parseStyle(stylesAttr);
}

function populateStyleAttributeEntries(attrs: cir.ElementAttrs, stylesAttr: string): void {
  attrs.push(AttributeMarker.Styles);
  const styles = generateStylePropAndValuesArray(stylesAttr);
  for (let i = 0; i < styles.length; i += 2) {
    const prop = styles[i];
    const value = styles[i + 1];
    attrs.push(prop, value);
  }
}

function populateClassAttributeEntries(attrs: cir.ElementAttrs, classAttr: string): void {
  attrs.push(AttributeMarker.Classes);
  const classes = generateClassesArray(classAttr);
  for (let i = 0; i < classes.length; i++) {
    const value = classes[i];
    attrs.push(value);
  }
}

function populateKeyValueEntries(attrs: cir.ElementAttrs, entries: KeyValueEntry[]): void {
  for (let i = 0; i < entries.length; i++) {
    let {prop, value} = entries[i];
    if (typeof prop === 'string') {  // case 1: prop is not namespaced
      attrs.push(prop);
    } else {  // case 2: prop is namespaced
      const namespaceDef = prop as NamespacedPropEntry;
      attrs.push(
          AttributeMarker.NamespaceURI,  // MARKER
          namespaceDef.namespace,        // ns (before :)
          namespaceDef.attr,             // prop (after :)
          );
    }
    attrs.push(value);
  }
}

export function populateProjectAsSelectors(
    attrs: cir.ElementAttrs, selectors: (string | SelectorFlags)[]): void {
  attrs.push(AttributeMarker.ProjectAs, selectors);
}

function populateI18nNameEntries(attrs: cir.ElementAttrs, names: string[]): void {
  attrs.push(AttributeMarker.I18n);
  attrs.push(...names);
}

function populateTemplateNameEntries(attrs: cir.ElementAttrs, names: string[]): void {
  attrs.push(AttributeMarker.Template);
  attrs.push(...names);
}

function populateBindingNameEntries(attrs: cir.ElementAttrs, names: string[]): void {
  attrs.push(AttributeMarker.Bindings);
  attrs.push(...names);
}

function keyValueAttrsIndexOf(attrs: KeyValueEntry[], key: any) {
  let index = -1;
  for (let i = 0; i < attrs.length; i++) {
    const entry = attrs[i];
    const isMatch =
        typeof entry.prop === 'string' ? entry.prop === key : entry.prop.fullName === key;
    if (isMatch) {
      index = i;
      break;
    }
  }
  return index;
}
