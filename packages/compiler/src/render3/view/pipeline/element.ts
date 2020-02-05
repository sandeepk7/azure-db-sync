/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {CirElementStart, CirElementEnd, ElementId, CreateIRKind} from './api';

export function createElementStart(id: ElementId, tag: string): CirElementStart {
  return {
    next: null,
    prev: null,
    kind: CreateIRKind.ElementStart,
    tag,
    id: id as ElementId,
  };
}

export function createElementEnd(id: ElementId): CirElementEnd {
  return {
    next: null,
    prev: null,
    kind: CreateIRKind.ElementEnd,
    id: id as ElementId,
  };
}
