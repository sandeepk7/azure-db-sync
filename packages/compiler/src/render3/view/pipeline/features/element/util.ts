/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AttributeMarker} from '../../../../../core';

import {ElementAttrs, Selector} from './node';

/**
 * The definition of the `filterFn` passed into the `filterAttrs` utility function.
 */
export interface FilterAttrsPredicate {
  (marker: AttributeMarker, value: string|number|Selector, key?: string, ns?: string): any;
}

/**
 * A utility function used to pluck out entries within a `ElementAttrs` collection.
 *
 * This function iterates on each of the entries within the provided `attrs` array
 * and will return a new `ElementAttrs` array once all the `attrs` entries have been
 * processed.
 *
 * Each time an entry is iterated over, the provided `filterFn` is called to determine
 * whether or not the value is to be included into the final `ElementAttrs` array. The
 * `filterFn` function is called using the `FilterAttrsPredicate` signature and will
 * expect a truthy or falsy value to be returned. If the return value is truthy then
 * the current `attrs` array entry will be included into the final `ElementAttrs` return
 * value, otherwise, when falsy, it will not be included.
 *
 * @returns a new `ElementAttrs` array with the filtered values included in it.
 * @example
 *
 * Here are some examples of the usage of this function:
 *
 * ```ts
 * // #1 remove all styles except for the width
 * const a1 = [AttributeMarker.Styles, 'width', '100px', 'height, '200px'];
 * const a1Filtered = filterAttrs(a1, (marker: AttributeMarker, value: string, key: string) => {
 *   return key === 'width'; // only include the width
 * });
 * console.log(a1Filtered); // [AttributeMarker.Styles, 'width', '100px'];
 *
 * // #2 remove all classes from the attrs
 * const a2 = [
 *   'prop',
 *   'value',
 *   AttributeMarker.Classes, 'active', 'hover',
 *   AttributeMarker.Bindings, 'myBinding',
 * ];
 * const a2Filtered = filterAttrs(a1, (marker: AttributeMarker, value: string, key: string) => {
 *   return marker !== AttributeMarker.Classes;
 * });
 * console.log(a2Filtered); // ['prop', 'value', AttributeMarker.Bindings, 'myBinding'];
 * ```
 */
export function filterAttrs(attrs: ElementAttrs, filterFn: FilterAttrsPredicate): ElementAttrs {
  const newAttrs: ElementAttrs = [];
  let i = 0;
  let lastMarkerIndex = -1;
  while (i < attrs.length) {
    const item = attrs[i];
    const marker = typeof item === 'number' ? item : AttributeMarker.DefaultKeyValue;
    if (marker != AttributeMarker.DefaultKeyValue) {
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

      // skip the marker since the values will now start at this index
      i++;
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

function forEachKeyValue(
    attrs: ElementAttrs, index: number, marker: AttributeMarker,
    fn: (key: string, value: any) => any): number {
  while (index < attrs.length) {
    const entry = attrs[index];
    if (typeof entry === 'number') {
      break;
    }
    const value = attrs[++index];
    const key = entry as string;
    fn(key, value);
    index++;
  }
  return index;
}

function forEachValue(
    attrs: ElementAttrs, index: number, marker: AttributeMarker, fn: (value: any) => any): number {
  while (index < attrs.length) {
    const entry = attrs[index];
    if (typeof entry === 'number') {
      break;
    }
    fn(entry);
    index++;
  }
  return index;
}
