/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {CirElementStart, CirElementEnd, ElementId, CirKind, CirElement} from './api';

export function createElementStart(id: ElementId, tag: string): CirElementStart {
  return {
    next: null,
    prev: null,
    kind: CirKind.ElementStart,
    tag,
    id,
    slot: null,
  };
}

export function createElementEnd(id: ElementId): CirElementEnd {
  return {
    next: null,
    prev: null,
    kind: CirKind.ElementEnd,
    id,
  };
}

export function createElement(id: ElementId, tag: string): CirElement {
  return {
    next: null,
    prev: null,
    kind: CirKind.Element,
    tag,
    id,
    slot: null,
  };
}
