/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {Element, ElementStart, Kind, List, Node, Transform} from '../ir/create';


/**
 * Converts empty elementStart/elementEnd instructions into element instruction
 */
export class SelfClosingElementTransform implements Transform {
  visit(node: Node, list: List): Node {
    if (node.kind === Kind.Template) {
      node.create.applyTransform(this);
    }
    if (node.kind !== Kind.ElementStart) {
      // Only interested in ElementStart nodes.
      return node;
    }

    if (node.next === null || node.next.kind !== Kind.ElementEnd) {
      // Only interested if followed by an ElementEnd.
      return node;
    }

    // Removing the next node is always safe.
    list.remove(node.next);
    return convertElementStartToSelfClosing(node);
  }
}

function convertElementStartToSelfClosing(node: ElementStart): Element {
  const convertedNode: Element = node as unknown as Element;
  convertedNode.kind = Kind.Element;
  return convertedNode;
}
