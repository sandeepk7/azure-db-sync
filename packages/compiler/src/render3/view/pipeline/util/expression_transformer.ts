import * as o from '../../../../output/output_ast'
import * as uir from '../ir/update';

export class ExpressionTransformer<C = unknown> implements uir.EmbeddedExpressionVisitor {
  visitEmbeddedExpression(ast: uir.EmbeddedExpression, ctx: C): o.Expression {
    const expr = ast.value;
    switch (expr.kind) {
      case uir.ExpressionKind.Interpolation:
        for (let i = 0; i < expr.expressions.length; i++) {
          expr.expressions[i] = expr.expressions[i].visitExpression(this, ctx);
        }
        break;
      case uir.ExpressionKind.PipeBind:
        if (expr.args !== null) {
          for (let i = 0; i < expr.args.length; i++) {
            expr.args[i] = expr.args[i].visitExpression(this, ctx);
          }
        }
        break;
      case uir.ExpressionKind.PureFunction:
        for (let i = 0; i < expr.args.length; i++) {
          expr.args[i] = expr.args[i].visitExpression(this, ctx);
        }
        break;
    }
    return ast;
  }

  visitReadVarExpr(ast: o.ReadVarExpr, ctx: C): o.Expression {
    return ast;
  }

  visitWriteVarExpr(expr: o.WriteVarExpr, ctx: C): o.Expression {
    expr.value = expr.value.visitExpression(this, ctx);
    return expr;
  }

  visitWriteKeyExpr(expr: o.WriteKeyExpr, ctx: C): o.Expression {
    expr.receiver = expr.receiver.visitExpression(this, ctx);
    expr.value = expr.value.visitExpression(this, ctx);
    return expr;
  }

  visitWritePropExpr(expr: o.WritePropExpr, ctx: C): o.Expression {
    expr.receiver = expr.receiver.visitExpression(this, ctx);
    expr.value = expr.value.visitExpression(this, ctx);
    return expr;
  }

  visitInvokeMethodExpr(ast: o.InvokeMethodExpr, ctx: C): o.Expression {
    ast.receiver = ast.receiver.visitExpression(this, ctx);
    for (let i = 0; i < ast.args.length; i++) {
      ast.args[i] = ast.args[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitInvokeFunctionExpr(ast: o.InvokeFunctionExpr, ctx: C): o.Expression {
    ast.fn = ast.fn.visitExpression(this, ctx);
    for (let i = 0; i < ast.args.length; i++) {
      ast.args[i] = ast.args[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitInstantiateExpr(ast: o.InstantiateExpr, ctx: C): o.Expression {
    ast.classExpr = ast.classExpr.visitExpression(this, ctx);
    for (let i = 0; i < ast.args.length; i++) {
      ast.args[i] = ast.args[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitLiteralExpr(ast: o.LiteralExpr, ctx: C): o.Expression {
    return ast;
  }

  visitLocalizedString(ast: o.LocalizedString, ctx: C): o.Expression {
    for (let i = 0; i < ast.expressions.length; i++) {
      ast.expressions[i] = ast.expressions[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitExternalExpr(ast: o.ExternalExpr, ctx: C): o.Expression {
    return ast;
  }

  visitConditionalExpr(ast: o.ConditionalExpr, ctx: C): o.Expression {
    ast.condition = ast.condition.visitExpression(this, ctx);
    ast.trueCase = ast.trueCase.visitExpression(this, ctx);
    ast.falseCase = ast.falseCase?.visitExpression(this, ctx);
    return ast;
  }

  visitNotExpr(ast: o.NotExpr, ctx: C): o.Expression {
    ast.condition = ast.condition.visitExpression(this, ctx);
    return ast;
  }

  visitAssertNotNullExpr(ast: o.AssertNotNull, ctx: C): o.Expression {
    ast.condition = ast.condition.visitExpression(this, ctx);
    return ast;
  }

  visitCastExpr(ast: o.CastExpr, ctx: C): o.Expression {
    ast.value = ast.value.visitExpression(this, ctx);
    return ast;
  }

  visitFunctionExpr(ast: o.FunctionExpr, ctx: C): o.Expression {
    throw new Error('unsupported in this context');
  }

  visitBinaryOperatorExpr(ast: o.BinaryOperatorExpr, ctx: C): o.Expression {
    ast.lhs = ast.lhs.visitExpression(this, ctx);
    ast.rhs = ast.rhs.visitExpression(this, ctx);
    return ast;
  }

  visitReadPropExpr(ast: o.ReadPropExpr, ctx: C): o.Expression {
    ast.receiver = ast.receiver.visitExpression(this, ctx);
    return ast;
  }

  visitReadKeyExpr(ast: o.ReadKeyExpr, ctx: C): o.Expression {
    ast.receiver = ast.receiver.visitExpression(this, ctx);
    return ast;
  }

  visitLiteralArrayExpr(ast: o.LiteralArrayExpr, ctx: C): o.Expression {
    for (let i = 0; i < ast.entries.length; i++) {
      ast.entries[i] = ast.entries[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitLiteralMapExpr(ast: o.LiteralMapExpr, ctx: C): o.Expression {
    for (let i = 0; i < ast.entries.length; i++) {
      ast.entries[i].value = ast.entries[i].value.visitExpression(this, ctx);
    }
    return ast;
  }

  visitCommaExpr(ast: o.CommaExpr, ctx: C): o.Expression {
    for (let i = 0; i < ast.parts.length; i++) {
      ast.parts[i] = ast.parts[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, ctx: C): o.Expression {
    return ast;
  }

  visitTypeofExpr(ast: o.TypeofExpr, ctx: C): o.Expression {
    ast.expr = ast.expr.visitExpression(this, ctx);
    return ast;
  }
}
