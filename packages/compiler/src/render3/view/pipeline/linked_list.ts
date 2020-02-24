/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
export interface Transform<T extends LinkedListNode<any>> {
  visit(node: T, list: LinkedList<T>): T;
}

export interface LinkedListNode<T extends LinkedListNode<any>> {
  next: T|null;
  prev: T|null;
}

export class LinkedList<T extends LinkedListNode<any>> {
  head: T|null = null;
  tail: T|null = null;

  applyTransform(transform: Transform<T>): void {
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
    this.forEach(node => arr.push(node));
    return arr;
  }

  forEach(cb: (node: T) => any) {
    let node = this.head;
    while (node !== null) {
      cb(node);
      node = node.next as T;
    }
  }
}
