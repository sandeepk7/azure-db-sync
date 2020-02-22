/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {Element, ElementEnd, ElementStart, Id, Kind} from './ir/create';

export function createElementStart(
    id: Id, tag: string, attrs: any[] | null | undefined): ElementStart {
  return {
    next: null,
    prev: null,
    attrs: attrs || null,
    kind: Kind.ElementStart, tag, id,
    slot: null,
  };
}

export function createElementEnd(id: Id): ElementEnd {
  return {
    next: null,
    prev: null,
    kind: Kind.ElementEnd, id,
  };
}

export function createElement(id: Id, tag: string, attrs: any[] | null | undefined): Element {
  return {
    next: null,
    prev: null,
    attrs: attrs || null,
    kind: Kind.Element, tag, id,
    slot: null,
  };
}
