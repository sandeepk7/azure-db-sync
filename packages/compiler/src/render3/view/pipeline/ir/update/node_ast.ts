import * as o from '../../../../../output/output_ast';
import * as list from '../../linked_list';
import {CirId} from '../create/id';

export type List = list.LinkedList<Node>;
export const List: {new (): List} = list.LinkedList;
export type Transform = list.Transform<Node>;

export type Node = TextInterpolate|Property|Attribute|QueryRefresh|StyleMap|StyleProp|ClassProp|
    ClassMap|Var|Advance;
export enum NodeKind {
  TextInterpolate,
  Property,
  StyleMap,
  StyleProp,
  ClassMap,
  ClassProp,
  Attribute,
  QueryRefresh,
  Var,
  Advance,
}

export interface TextInterpolate extends list.LinkedListNode<Node> {
  kind: NodeKind.TextInterpolate;
  id: CirId;
  text: string[];
  expression: o.Expression[];
}

export interface Property extends list.LinkedListNode<Node> {
  kind: NodeKind.Property;
  name: string;
  expression: o.Expression;
}

export interface StyleProp extends list.LinkedListNode<Node> {
  kind: NodeKind.StyleProp;
  name: string;
  expression: o.Expression;
}

export interface StyleMap extends list.LinkedListNode<Node> {
  kind: NodeKind.StyleMap;
  expression: o.Expression;
}

export interface ClassProp extends list.LinkedListNode<Node> {
  kind: NodeKind.ClassProp;
  name: string;
  expression: o.Expression;
}

export interface ClassMap extends list.LinkedListNode<Node> {
  kind: NodeKind.ClassMap;
  expression: o.Expression;
}

export interface Attribute extends list.LinkedListNode<Node> {
  kind: NodeKind.Attribute;
}

export interface QueryRefresh extends list.LinkedListNode<Node> {
  kind: NodeKind.QueryRefresh;
}

export type VarId = number&{__brand: 'uir.VarId'};
export enum VarIdentity {
  TemplateContext,
}
export interface Var extends list.LinkedListNode<Node> {
  kind: NodeKind.Var;
  id: VarId;
  name: string|null;
  value: o.Expression;
}

export interface Advance extends list.LinkedListNode<Node> {
  kind: NodeKind.Advance;
  delta: number;
}
