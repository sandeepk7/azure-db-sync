/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Host, HostStage} from '../ir/api';
import * as cir from '../ir/create';
import * as uir from '../ir/update';
import {LinkedList, LinkedListNode} from '../linked_list';

import {BaseTemplateStage} from './base';

export class ChainingStage extends
    BaseTemplateStage<ChainingCreateTransform, ChainingUpdateTransform> {
  makeCreateTransform(): ChainingCreateTransform {
    return new ChainingCreateTransform();
  }

  makeUpdateTransform(): ChainingUpdateTransform {
    return new ChainingUpdateTransform();
  }
}

export class ChainingHostStage implements HostStage {
  transform(host: Host): void {
    host.update.applyTransform(new ChainingUpdateTransform());
  }
}

export class ChainingCreateTransform implements cir.Transform {
  static VALID_TO_CHAIN = new Set<cir.Kind>([
    cir.Kind.Element,
  ]);

  visit(node: cir.Node, list: cir.List): cir.Node {
    if (!ChainingCreateTransform.VALID_TO_CHAIN.has(node.kind)) {
      return node;
    }

    const chainHead = node;
    let chainTail = node;
    while (chainTail.next !== null && chainTail.next.kind === chainHead.kind) {
      chainTail = chainTail.next;
    }

    if (chainTail !== chainHead) {
      const chainNode = convertNodesToChainedInstruction(chainHead, chainTail, cir.Kind.Chain);

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

export class ChainingUpdateTransform implements uir.Transform {
  static VALID_TO_CHAIN = new Set<uir.NodeKind>([
    uir.NodeKind.Property,
    uir.NodeKind.ClassProp,
    uir.NodeKind.StyleProp,
  ]);

  visit(node: uir.Node, list: uir.List): uir.Node {
    if (!ChainingUpdateTransform.VALID_TO_CHAIN.has(node.kind)) {
      return node;
    }

    const chainHead = node;
    let chainTail = node;
    while (chainTail.next !== null && chainTail.next.kind === chainHead.kind) {
      chainTail = chainTail.next;
    }

    if (chainTail !== chainHead) {
      const chainNode = convertNodesToChainedInstruction(chainHead, chainTail, uir.NodeKind.Chain);

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



function convertNodesToChainedInstruction(
    head: cir.Node, tail: cir.Node, kind: cir.Kind.Chain): cir.Chain;
function convertNodesToChainedInstruction(
    head: uir.Node, tail: uir.Node, kind: uir.NodeKind.Chain): uir.Chain;
function convertNodesToChainedInstruction<T extends LinkedListNode<any>>(
    head: T, tail: T, kind: cir.Kind.Chain|uir.NodeKind.Chain): cir.Chain|uir.Chain {
  const prev = head.prev as T;
  const next = tail.next as T;
  head.prev = null;
  tail.next = null;

  const list = new LinkedList<T>();
  list.head = head;
  list.tail = tail;

  const chain: cir.Chain|uir.Chain = ({
    kind,
    prev,
    next,
    list,
  } as unknown as cir.Chain | uir.Chain);

  if (next !== null) {
    next.prev = chain;
  }

  if (prev !== null) {
    prev.next = chain;
  }

  return chain;
}
