/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {LinkedListNode} from '../linked_list';

export function replaceNode(oldNode: LinkedListNode<any>, newNode: LinkedListNode<any>): void {
  newNode.prev = oldNode.prev;
  newNode.next = oldNode.next;
  oldNode.next = oldNode.prev = null;
}
