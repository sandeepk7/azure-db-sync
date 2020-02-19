/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as list from '../linked_list';

export type Id = number & {__brand: 'cir.Id'};
export type DataSlot = number & {__brand: 'DataSlot'};

export type Node = ElementStart | ElementEnd | Text | Element | Chain;

export const enum Kind {
  ElementStart,
  ElementEnd,
  Element,
  Text,
  Chain,
}

export interface ElementStart extends list.LinkedListNode<Node> {
  kind: Kind.ElementStart;
  tag: string;
  attrs: unknown[]|number|null;
  id: Id;
  slot: DataSlot|null;
}

export interface Element extends Omit<ElementStart, 'kind'> { kind: Kind.Element; }

export interface ElementEnd extends list.LinkedListNode<Node> {
  kind: Kind.ElementEnd;
  id: Id;
}

export interface Text extends list.LinkedListNode<Node> {
  kind: Kind.Text;
  value: string|null;
  id: Id;
  slot: DataSlot|null;
}

export interface IdGen { next(): Id; }

export interface Chain<T extends Node = Node> extends list.LinkedListNode<Node> {
  kind: Kind.Chain;
  list: List<T>;
}

export type List<T extends Node = Node> = list.LinkedList<T>;
export type Transform<T extends Node = Node> = list.Transform<T>;
