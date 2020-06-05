/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ElementAttrs, Selector} from "./node";
import {AttributeMarker} from '../../../../../core';

export function filterAttrs(attrs: ElementAttrs, filterFn: (marker: AttributeMarker, value: string | number | Selector, key?: string, ns?: string) => any): ElementAttrs {
  const newAttrs: ElementAttrs = [];
  let i = 0;
  let lastMarkerIndex = -1;
  while (i < attrs.length) {
    const item = attrs[i++];
    const marker = typeof item === 'number' ? item : AttributeMarker.DefaultKeyValue;
    if (marker !== AttributeMarker.DefaultKeyValue) {
      // this means that a marker was set in the new array,
      // but no items were added for that marker. If and when
      // this happens let's just replace the old marker with
      // the new one
      if (lastMarkerIndex !== -1 && lastMarkerIndex === newAttrs.length - 1) {
        newAttrs[lastMarkerIndex] = marker;
      } else {
        newAttrs.push(marker);
        lastMarkerIndex = newAttrs.length - 1;
      }
    }

    switch (marker) {
      // [MARKER, prop, value, prop2, value2]
      case AttributeMarker.DefaultKeyValue:
      case AttributeMarker.Styles:
        i = forEachKeyValue(attrs, i, marker, (key: string, value: any) => {
          if (filterFn(marker, value, key)) {
            newAttrs.push(key, value);
          }
        });
        break;

      // [NS_MARKER, ns, attr, value]
      case AttributeMarker.NamespaceURI:
        const ns = attrs[i++] as string;
        const attr = attrs[i++] as string;
        const value = attrs[i++];
        if (filterFn(marker, value, attr, ns)) {
          newAttrs.push(ns, attr, value);
        }
        break;

      // [MARKER, val, val, val, val]
      case AttributeMarker.Classes:
      case AttributeMarker.Bindings:
      case AttributeMarker.Template:
      case AttributeMarker.ProjectAs:
      case AttributeMarker.I18n:
        i = forEachValue(attrs, i, marker, (value: any) => {
          if (filterFn(marker, value)) {
            newAttrs.push(value);
          }
        });
        break;

      default:
        throw new Error(`Unsupported binding marker: ${marker}`);
    }
  }

  // this is to avoid the case of a marker having been
  // set at the end of the array, but no items were set
  // afterwards...
  if (lastMarkerIndex === newAttrs.length - 1) {
    newAttrs.pop();
  }

  return newAttrs;
}

function forEachKeyValue(attrs: ElementAttrs, index: number, marker: AttributeMarker, fn: (key: string, value: any) => any): number {
  while (index < attrs.length) {
    const entry = attrs[index++];
    if (typeof entry === 'number') {
      break;
    }
    const value = attrs[index++];
    const key = entry as string;
    fn(key, value);
  }
  return index;
}

function forEachValue(attrs: ElementAttrs, index: number, marker: AttributeMarker, fn: (value: any) => any): number {
  while (index < attrs.length) {
    const entry = attrs[index++];
    if (typeof entry === 'number') {
      break;
    }
    fn(entry);
  }
  return index;
}
