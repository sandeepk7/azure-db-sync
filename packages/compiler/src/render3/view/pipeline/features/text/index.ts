import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as ir from '../../ir';
import {emitInterpolationExpr, InterpolationConfig, InterpolationExpr} from '../binding/interpolation';

export class Text extends ir.CreateNode implements ir.CreateSlotAspect {
  slot: ir.DataSlot|null = null;

  constructor(readonly id: ir.Id, public value: string|null = null) {
    super();
  }

  allocateExtraSlots(): void {}
}

export class TextInterpolate extends ir.UpdateNode {
  constructor(readonly id: ir.Id, public expression: InterpolationExpr) {
    super();
  }

  visitExpressions(visitor: o.ExpressionVisitor, ctx: any): void {
    this.expression.visitExpression(visitor, ctx);
  }
}

export class TextCreateEmitter implements ir.CreateEmitter {
  emit(node: ir.CreateNode): o.Statement|null {
    if (!(node instanceof Text)) {
      return null;
    }
    const args: o.Expression[] = [o.literal(node.slot!)];
    if (node.value !== null) {
      args.push(o.literal(node.value));
    }
    return o.importExpr(R3.text).callFn(args).toStmt();
  }
}

export class TextUpdateEmitter implements ir.UpdateEmitter {
  emit(node: ir.UpdateNode): o.Statement|null {
    if (!(node instanceof TextInterpolate)) {
      return null;
    }

    return emitInterpolationExpr(node.expression, TEXT_INTERPOLATE_CONFIG);
  }
}

const TEXT_INTERPOLATE_CONFIG: InterpolationConfig = {
  name: 'textInterpolate',
  expressionCountSpecificInstruction: [
    R3.textInterpolate,
    R3.textInterpolate1,
    R3.textInterpolate2,
    R3.textInterpolate3,
    R3.textInterpolate4,
    R3.textInterpolate5,
    R3.textInterpolate6,
    R3.textInterpolate7,
    R3.textInterpolate8,
  ],
  varExpressionCountInstruction: R3.textInterpolateV,
};
