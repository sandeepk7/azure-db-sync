/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
export type ElementId = number & { __brand: 'ElementId' };
export type CirDataSlot = number & { __brand: 'CirDataSlot' };

export const enum CirKind {
  ElementStart,
  ElementEnd,
  Element,
  Text,
  Chain,
}

export interface CirBase {
  next: CirNode|null;
  prev: CirNode|null;
}

export type CirNode = CirElementStart | CirElementEnd | CirText | CirElement;

export interface CirElementStart extends CirBase {
  kind: CirKind.ElementStart;
  tag: string;
  id: ElementId;
  slot: CirDataSlot|null;
}

export interface CirElement extends Omit<CirElementStart, 'kind'> {
  kind: CirKind.Element;
}

export interface CirElementEnd extends CirBase {
  kind: CirKind.ElementEnd;
  id: ElementId;
}

export interface CirText extends CirBase {
  kind: CirKind.Text;
  value: string|null;
  id: ElementId;
  slot: CirDataSlot|null;
}

export class CirList<T extends CirNode = CirNode> {
  head: T|null = null;
  tail: T|null = null;

  applyTransform(transform: CirTransform): void {
    let node = this.head;
    while (node !== null) {
      node = transform.visit(node, this) as T;
      node = node.next as T;
    }
  }

  append(node: T): void {
    if (this.tail !== null) {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    } else {
      this.head = node;
      this.tail = node;
    }
  }

  remove(node: T): T|null {
    const next = node.next;

    if (this.head === node) {
      this.head = node.next as T;
      if (this.tail === node) {
        this.tail = node.next as T;
      }
    } else if (node.prev !== null) {
      node.prev.next = node.next;
      if (this.tail === node) {
        this.tail = node.prev as T;
      } else if (node.next !== null) {
        node.next.prev = node.prev;
      } else {
        throw new Error('AssertionError: non-tail node has null next pointer');
      }
    } else {
      throw new Error('AssertionError: non-head node has null prev pointer');
    }

    node.prev = null;
    node.next = null;

    return next as T;
  }

  toArray(): T[] {
    const arr: T[] = [];
    let node = this.head;
    while (node !== null) {
      arr.push(node);
      node = node.next as T;
    }
    return arr;
  }
}

export interface ElementIdGen {
  next(): ElementId;
}

export interface CirChain<T extends CirNode = CirNode> extends CirBase {
  kind: CirKind.Chain;
  list: CirList<T>;
}

export interface CirTransform {
  visit(node: CirNode, list: CirList): CirNode;
}
