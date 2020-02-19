/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {DataSlot, Kind, List, Node, Transform} from '../api/cir';


/**
 */
export class SlotAllocatorTransform implements Transform {
  private _slot = 0;

  visit(node: Node, list: List): Node {
    switch (node.kind) {
      case Kind.ElementStart:
      case Kind.Element:
      case Kind.Text:
        node.slot = (this._slot++) as DataSlot;
        break;
    }
    return node;
  }
}
