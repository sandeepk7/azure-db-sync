/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {CirText, ElementId, CreateIRKind} from "./api";

export function createText(id: number, value: string|null): CirText {
  return {
    next: null,
    prev: null,
    kind: CreateIRKind.Text,
    id: id as ElementId,
    value,
  }
}
