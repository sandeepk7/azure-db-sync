/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {CirTransform, CirNode, CirKind, CirList, CirElement, CirElementStart} from '../api';

/**
 * Converts empty elementStart/elementEnd instructions into element instruction
 */
export class SelfClosingElementTransform implements CirTransform {
  visit(node: CirNode, list: CirList): CirNode {
    if (node.kind !== CirKind.ElementStart) {
        // Only interested in ElementStart nodes.
      return node;
    }

    if (node.next === null || node.next.kind !== CirKind.ElementEnd) {
      // Only interested if followed by an ElementEnd.
      return node;
    }

      // Removing the next node is always safe.
    list.remove(node.next);
    return convertElementStartToSelfClosing(node);
  }
}

function convertElementStartToSelfClosing(node: CirElementStart): CirElement {
  const convertedNode: CirElement = node as unknown as CirElement;
  convertedNode.kind = CirKind.Element;
  return convertedNode;
}
