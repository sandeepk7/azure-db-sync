import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as ir from '../../ir';
import {emitInterpolationExpr, InterpolationConfig, InterpolationExpr} from '../binding/interpolation';

import {countBindings} from './util';

export class StyleProp extends ir.UpdateNode implements ir.BindingSlotConsumerAspect,
                                                        ir.UpdateSlotAspect {
  slot: ir.DataSlot|null = null;

  constructor(
      readonly id: ir.Id, public name: string, public suffix: string|null,
      public expression: o.Expression) {
    super();
  }

  visitExpressions(visitor: o.ExpressionVisitor, ctx: any): void {
    this.expression.visitExpression(visitor, ctx);
  }

  countUpdateBindingsUsed(): number {
    return countBindings(this.expression);
  }
}

export class StyleMap extends ir.UpdateNode implements ir.BindingSlotConsumerAspect,
                                                       ir.UpdateSlotAspect {
  slot: ir.DataSlot|null = null;

  constructor(readonly id: ir.Id, public expression: o.Expression) {
    super();
  }

  visitExpressions(visitor: o.ExpressionVisitor, ctx: any): void {
    this.expression.visitExpression(visitor, ctx);
  }

  countUpdateBindingsUsed(): number {
    return countBindings(this.expression);
  }
}

export class StyleEmitter implements ir.UpdateEmitter {
  emit(node: ir.UpdateNode): o.Statement|null {
    if (node instanceof StyleProp) {
      // ɵɵstylePropInterpolateN()
      if (node.expression instanceof InterpolationExpr) {
        return emitInterpolationExpr(node.expression, STYLE_PROP_INTERPOLATION_CONFIG);
      }

      const params: o.Expression[] = [
        o.literal(node.name),
        node.expression,
      ];

      if (node.suffix !== null) {
        params.push(o.literal(node.suffix));
      }

      // ɵɵstyleProp()
      return o.importExpr(R3.styleProp).callFn(params).toStmt();
    } else if (node instanceof StyleMap) {
      // ɵɵstyleMapInterpolateN()
      if (node.expression instanceof InterpolationExpr) {
        return emitInterpolationExpr(node.expression, STYLE_MAP_INTERPOLATION_CONFIG);
      }

      // ɵɵstyleMap()
      return o.importExpr(R3.styleMap)
          .callFn([
            node.expression,
          ])
          .toStmt();
    } else {
      return null;
    }
  }
}

const STYLE_MAP_INTERPOLATION_CONFIG: InterpolationConfig = {
  name: 'styleMapInterpolate',
  expressionCountSpecificInstruction: [
    null,
    R3.styleMapInterpolate1,
    R3.styleMapInterpolate2,
    R3.styleMapInterpolate3,
    R3.styleMapInterpolate4,
    R3.styleMapInterpolate5,
    R3.styleMapInterpolate6,
    R3.styleMapInterpolate7,
    R3.styleMapInterpolate8,
  ],
  varExpressionCountInstruction: R3.styleMapInterpolateV,
};

const STYLE_PROP_INTERPOLATION_CONFIG: InterpolationConfig = {
  name: 'stylePropInterpolate',
  expressionCountSpecificInstruction: [
    null,
    R3.stylePropInterpolate1,
    R3.stylePropInterpolate2,
    R3.stylePropInterpolate3,
    R3.stylePropInterpolate4,
    R3.stylePropInterpolate5,
    R3.stylePropInterpolate6,
    R3.stylePropInterpolate7,
    R3.stylePropInterpolate8,
  ],
  varExpressionCountInstruction: R3.stylePropInterpolateV,
};
