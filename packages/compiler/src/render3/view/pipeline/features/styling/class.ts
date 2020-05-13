import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as ir from '../../ir';
import {emitInterpolationExpr, InterpolationConfig, InterpolationExpr} from '../binding/interpolation';

import {countBindings} from './util';

export class ClassProp extends ir.UpdateNode implements ir.BindingSlotConsumerAspect,
                                                        ir.UpdateSlotAspect {
  slot: ir.DataSlot|null = null;

  constructor(readonly id: ir.Id, public name: string, public expression: o.Expression) {
    super();
  }

  visitExpressions(visitor: o.ExpressionVisitor, ctx: any): void {
    this.expression.visitExpression(visitor, ctx);
  }

  countUpdateBindingsUsed(): number {
    return 2;
  }
}

export class ClassMap extends ir.UpdateNode implements ir.BindingSlotConsumerAspect,
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

export class ClassEmitter implements ir.UpdateEmitter {
  emit(node: ir.UpdateNode): o.Statement|null {
    if (node instanceof ClassProp) {
      // ɵɵclassProp()
      return o.importExpr(R3.classProp)
          .callFn([
            o.literal(node.name),
            node.expression,
          ])
          .toStmt();

    } else if (node instanceof ClassMap) {
      // ɵɵclassMap()
      if (node.expression instanceof InterpolationExpr) {
        return emitInterpolationExpr(node.expression, CLASS_MAP_INTERPOLATION_CONFIG);
      } else {
        return o.importExpr(R3.classMap)
            .callFn([
              node.expression,
            ])
            .toStmt();
      }
    }
    return null;
  }
}

const CLASS_MAP_INTERPOLATION_CONFIG: InterpolationConfig = {
  name: 'classMapInterpolate',
  expressionCountSpecificInstruction: [
    R3.classMap,
    R3.classMapInterpolate1,
    R3.classMapInterpolate2,
    R3.classMapInterpolate3,
    R3.classMapInterpolate4,
    R3.classMapInterpolate5,
    R3.classMapInterpolate6,
    R3.classMapInterpolate7,
    R3.classMapInterpolate8,
  ],
  varExpressionCountInstruction: R3.classMapInterpolateV,
};
