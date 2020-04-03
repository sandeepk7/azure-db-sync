import * as o from '../../../../../output/output_ast';
import {Reference as CirReference} from '../create/ref';
import {Node, NodeKind, VarId} from './node_ast';

export type Expression =
    PureFunctionExpr | PipeBindExpr | UnresolvedExpr | NextContextExpr | VarExpr | ReferenceExpr;
export enum ExpressionKind {
  PureFunction,
  PipeBind,
  NextContext,
  Reference,

  // Internal type representing an unresolved reference
  Unresolved,
  // Internal type representing a variable
  Var,
}

export interface EmbeddedExpressionVisitor<C = unknown> extends o.ExpressionVisitor {
  visitEmbeddedExpression?(node: EmbeddedExpression, ctx: C): any;
}

export class EmbeddedExpression extends o.Expression {
  constructor(readonly value: Expression) { super(/* type */ undefined); }

  visitExpression(visitor: EmbeddedExpressionVisitor, ctx: any): any {
    if (visitor.visitEmbeddedExpression !== undefined) {
      return visitor.visitEmbeddedExpression(this, ctx);
    } else {
      throw new Error('EmbeddedExpression cannot be used in this context');
    }
  }

  isEquivalent(e: o.Expression): boolean {
    throw new Error('EmbeddedExpression cannot be used in this context');
  }

  isConstant(): boolean { throw new Error('EmbeddedExpression cannot be used in this context'); }
}

export interface PureFunctionExpr {
  kind: ExpressionKind.PureFunction;
  inputs: o.Expression[];
}

export interface PipeBindExpr {
  kind: ExpressionKind.PipeBind;
  args: o.Expression[]|null;
}

export interface NextContextExpr { kind: ExpressionKind.NextContext, jump: number; }

export interface UnresolvedExpr {
  kind: ExpressionKind.Unresolved;
  name: string;
}

export interface VarExpr {
  kind: ExpressionKind.Var;
  id: VarId;
}

export interface ReferenceExpr {
  kind: ExpressionKind.Reference;
  ref: CirReference,
}

export function visitAllExpressions<C = unknown>(
    node: Node, visitor: EmbeddedExpressionVisitor<C>, context?: C): void {
  switch (node.kind) {
    case NodeKind.TextInterpolate:
      for (let i = 0; i < node.expression.length; i++) {
        node.expression[i] = node.expression[i].visitExpression(visitor, context);
      }
      break;
    case NodeKind.Var:
      node.value = node.value.visitExpression(visitor, context);
      break;
  }
}
