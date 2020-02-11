/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {CirTransform, CirDataSlot, CirNode, CirKind, CirList} from '../api';

/**
 */
export class SlotAllocatorTransform implements CirTransform {
  private _slot = 0;

  visit(node: CirNode, list: CirList): CirNode {
    switch (node.kind) {
      case CirKind.ElementStart:
      case CirKind.Element:
      case CirKind.Text:
        node.slot = (this._slot++) as CirDataSlot;
        break;
    }
    return node;
  }
}
