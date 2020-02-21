import * as o from '../../../../output/output_ast';
import * as list from '../linked_list';

export type List = list.LinkedList<Node>;
export type Transform = list.Transform<Node>;

export type Node = TextInterpolate | Property | Attribute | QueryRefresh | StyleMap | StyleProp;
export enum NodeKind {
  TextInterpolate,
  Property,
  StyleMap,
  StyleProp,
  ClassMap,
  ClassProp,
  Attribute,
  QueryRefresh,
}

export interface TextInterpolate extends list.LinkedListNode<Node> {
  kind: NodeKind.TextInterpolate;
  text: string[];
  expression: o.Expression[];
}

export interface Property extends list.LinkedListNode<Node> {
  kind: NodeKind.Property;
  name: string;
  expression: o.Expression[];
}

export interface StyleMap extends list.LinkedListNode<Node> {
  kind: NodeKind.StyleMap;
  expression: o.Expression[];
}

export interface StyleProp extends list.LinkedListNode<Node> {
  kind: NodeKind.StyleProp;
  name: string;
  expression: o.Expression[];
}

export interface Attribute extends list.LinkedListNode<Node> { kind: NodeKind.Attribute; }

export interface QueryRefresh extends list.LinkedListNode<Node> { kind: NodeKind.QueryRefresh; }

export type Expression = PureFunctionExpr | PipeBindExpr;
export enum ExpressionKind {
  PureFunction,
  PipeBind,
}

export type EmbeddedExpression = o.WrappedNodeExpr<Expression>;

export interface PureFunctionExpr {
  kind: ExpressionKind.PureFunction;
  inputs: o.Expression[];
}

export interface PipeBindExpr {
  kind: ExpressionKind.PipeBind;
  args: o.Expression[]|null;
}
