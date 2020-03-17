/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import * as o from '../../../../../output/output_ast';
import * as list from '../../linked_list';
import * as uir from '../update';

import {CirId} from './id';

export type Id = CirId;

export type DataSlot = number & {__brand: 'DataSlot'};

export type Node = ElementStart | ElementEnd | Text | Element | Chain | Template;

export type Selector = string | Array<string|number>;
export type ElementAttrs = Array<string|number|Selector>;

export enum Kind {
  ElementStart,
  ElementEnd,
  Element,
  Text,
  Chain,
  Template,
}

export interface ElementStart extends list.LinkedListNode<Node> {
  kind: Kind.ElementStart;
  tag: string;
  attrs: ElementAttrs|number|null;
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

export interface Template extends list.LinkedListNode<Node> {
  kind: Kind.Template;
  id: Id;

  create: List;
  update: uir.List;

  slot: DataSlot|null;
}

export interface IdGen { next(): Id; }

export interface Chain<T extends Node = Node> extends list.LinkedListNode<Node> {
  kind: Kind.Chain;
  list: List<T>;
}

export type List<T extends Node = Node> = list.LinkedList<T>;
export const List: {new<T extends Node = Node>(): List<T>} = list.LinkedList;
export type Transform<T extends Node = Node> = list.Transform<T>;

export function nodeToString(node: Node): string {
  switch (node.kind) {
    case Kind.ElementStart:
      return `ElementStart(${identifierOfNode(node)}, ${node.tag})`;
    case Kind.Element:
      return `Element(${identifierOfNode(node)}, ${node.tag})`;
    case Kind.Text:
      const textPart = node.value !== null ? `, '${node.value}'` : '';
      return `Text(${identifierOfNode(node)}${textPart})`;
    case Kind.ElementEnd:
      return `ElementEnd()`;
    case Kind.Chain:
      return `Chain()`;
    case Kind.Template:
      const create =
          node.create.toString(nodeToString).split('\n').map(line => '  ' + line).join('\n');
      const update =
          node.update.toString(uir.nodeToString).split('\n').map(line => '   ' + line).join('\n');
      return `Template(${identifierOfNode(node)}, [\n${create}\n], [\n${update}\n])`;
  }
}

function identifierOfNode(node: {id: Id, slot: DataSlot | null}): string {
  if (node.slot !== null) {
    return `Slot(${node.slot})`;
  } else {
    return `Id(${node.id})`;
  }
}
