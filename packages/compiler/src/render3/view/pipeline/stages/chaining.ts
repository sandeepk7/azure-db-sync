/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as cir from '../api/cir';
import {LinkedList} from '../linked_list';


/**
 * Transforms multiple repeated instances of a CirNode into a CirChain
 */
export class ChainingTransform implements cir.Transform {
  visit(node: cir.Node, list: cir.List): cir.Node {
    const chainHead = node;
    let chainTail = node;
    while (chainTail.next !== null && chainTail.next.kind === chainHead.kind) {
      chainTail = chainTail.next;
    }

    if (chainTail !== chainHead) {
      const chainNode = convertNodesToChainedInstruction(chainHead, chainTail);

      if (node === list.head) {
        list.head = chainNode;
      }

      if (node === list.tail) {
        list.tail = chainNode;
      }

      node = chainNode;
    }

    return node;
  }
}

function convertNodesToChainedInstruction(head: cir.Node, tail: cir.Node): cir.Chain {
  const prev = head.prev;
  const next = tail.next;
  head.prev = null;
  tail.next = null;

  const list = new LinkedList<cir.Node>();
  list.head = head;
  list.tail = tail;

  const chain: cir.Chain = {
    kind: cir.Kind.Chain,
    prev,
    next,
    list,
  };

  if (next !== null) {
    next.prev = chain;
  }

  if (prev !== null) {
    prev.next = chain;
  }

  return chain;
}
