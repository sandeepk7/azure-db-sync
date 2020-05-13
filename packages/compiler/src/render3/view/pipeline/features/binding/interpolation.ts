import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';

export class InterpolationExpr extends ir.Expression {
  readonly kind = 'InterpolateExpr';

  constructor(public expressions: o.Expression[], public strings: string[]) {
    super();
  }

  visitChildren(visitor: ir.ExpressionVisitor, ctx: any): void {
    for (let i = 0; i < this.expressions.length; i++) {
      this.expressions[i] = this.expressions[i].visitExpression(visitor, ctx);
    }
  }

  toFinalExpression(): o.Expression {
    // InterpolationExprs are passed through to the output.
    return this;
  }
}

export interface InterpolationConfig {
  name: string;
  expressionCountSpecificInstruction: (o.ExternalReference|null)[];
  varExpressionCountInstruction: o.ExternalReference;
}

export function emitInterpolationExpr(
    expr: InterpolationExpr, config: InterpolationConfig, initialArgs: o.Expression[] = []) {
  if (expr.expressions.length === 1 && expr.strings.length === 2 && expr.strings[0] === '' &&
      expr.strings[1] === '' && config.expressionCountSpecificInstruction.length > 0 &&
      config.expressionCountSpecificInstruction[0] !== null) {
    // Special case for an interpolation which wraps a single expression with empty literals. If
    // `config.expressionCountSpecificInstruction[0]` is not `null`, then this case is supported by
    // the configuration and is used here. This generates the instruction call without the empty
    // string bookends.

    const instruction = config.expressionCountSpecificInstruction[0];
    return o.importExpr(instruction).callFn([expr.expressions[0]]).toStmt();
  }

  const params = generateInterpolationParams(expr.expressions, expr.strings);
  const expressionCount = expr.expressions.length;
  if (expressionCount < config.expressionCountSpecificInstruction.length) {
    // A specific instruction variant exists for this length.
    const instruction = config.expressionCountSpecificInstruction[expressionCount];
    if (instruction === null) {
      throw new Error(`AssertionError: unsupported expression count of ${
          expressionCount} for interpolation instruction ${config.name}`);
    }
    return o.importExpr(instruction).callFn([...initialArgs, ...params]).toStmt();
  } else {
    // No specific instruction exists for this number of expressions, so use the variable length
    // variant.
    return o.importExpr(config.varExpressionCountInstruction)
        .callFn([...initialArgs, o.literalArr(params)])
        .toStmt()
  }
}

function generateInterpolationParams(
    expressions: o.Expression[], strings: string[]): o.Expression[] {
  const params: o.Expression[] = [];
  for (let i = 0; i < expressions.length; i++) {
    params.push(o.literal(strings[i]));
    params.push(expressions[i]);
  }
  if (strings.length > expressions.length) {
    params.push(o.literal(strings[expressions.length]));
  }
  return params;
}