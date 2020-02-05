/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {CirList, CirNode} from "./api";

export function createCirList(): CirList {
  return {
    head: null,
    tail: null,
  };
}

export function appendCirList(list: CirList, node: CirNode) {
  node.prev = list.tail;
  if (list.tail === null) {
    list.tail = node;
  }
  if (list.head === null) {
    list.head = node;
  }
}
