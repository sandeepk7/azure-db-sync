/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ast from '../../../../expression_parser/ast';
import * as o from '../../../../output/output_ast';
import * as uir from '../ir/update';

export enum ReadResultKind {
  Receiver,
  Reference,
}

export interface ReadResult {
  kind: ReadResultKind, expression: o.Expression;
}

export interface Context {}

export class ValuePreprocessor implements ast.AstVisitor {
  process(value: ast.AST): o.Expression {
    return value.visit(this);
  }

  visitASTWithSource(node: ast.ASTWithSource): o.Expression {
    return node.ast.visit(this);
  }

  visitPropertyRead(node: ast.PropertyRead): o.Expression {
    if (node.receiver instanceof ast.ImplicitReceiver) {
      // This is a top-level read of a property. There's no way to know what this points to in
      // isolation.
      return new uir.EmbeddedExpression({
        kind: uir.ExpressionKind.Unresolved,
        name: node.name,
      });
    } else {
      const receiver = node.receiver.visit(this);
      return new o.ReadPropExpr(receiver, node.name);
    }
  }

  visitBinary(node: ast.Binary) {
    throw new Error('Method not implemented.');
  }
  visitChain(node: ast.Chain) {
    throw new Error('Method not implemented.');
  }
  visitConditional(node: ast.Conditional) {
    throw new Error('Method not implemented.');
  }
  visitFunctionCall(node: ast.FunctionCall) {
    throw new Error('Method not implemented.');
  }
  visitImplicitReceiver(node: ast.ImplicitReceiver) {
    throw new Error('Should have been handled before this point.');
  }
  visitInterpolation(node: ast.Interpolation) {
    throw new Error('Method not implemented.');
  }
  visitKeyedRead(node: ast.KeyedRead) {
    throw new Error('Method not implemented.');
  }
  visitKeyedWrite(node: ast.KeyedWrite) {
    throw new Error('Method not implemented.');
  }
  visitLiteralArray(node: ast.LiteralArray) {
    throw new Error('Method not implemented.');
  }
  visitLiteralMap(node: ast.LiteralMap) {
    throw new Error('Method not implemented.');
  }
  visitLiteralPrimitive(node: ast.LiteralPrimitive) {
    throw new Error('Method not implemented.');
  }
  visitMethodCall(node: ast.MethodCall): o.Expression {
    const args = node.args.map(arg => arg.visit(this));
    if (node.receiver instanceof ast.ImplicitReceiver) {
      const target = new uir.EmbeddedExpression({
        kind: uir.ExpressionKind.Unresolved,
        name: node.name,
      });
      return new o.InvokeFunctionExpr(target, args);
    } else {
      return new o.InvokeMethodExpr(node.receiver.visit(this), node.name, args);
    }
  }
  visitPipe(node: ast.BindingPipe) {
    throw new Error('Method not implemented.');
  }
  visitPrefixNot(node: ast.PrefixNot) {
    throw new Error('Method not implemented.');
  }
  visitNonNullAssert(node: ast.NonNullAssert) {
    throw new Error('Method not implemented.');
  }
  visitPropertyWrite(node: ast.PropertyWrite) {
    throw new Error('Method not implemented.');
  }
  visitQuote(node: ast.Quote) {
    throw new Error('Method not implemented.');
  }
  visitSafeMethodCall(node: ast.SafeMethodCall) {
    throw new Error('Method not implemented.');
  }
  visitSafePropertyRead(node: ast.SafePropertyRead) {
    throw new Error('Method not implemented.');
  }
}
