/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as ir from '../../ir';
import {ParseSourceSpan} from '../../../../../parse_util';

import {emitInterpolationExpr, InterpolationConfig, InterpolationExpr} from './interpolation';

export class Property extends ir.UpdateNode implements ir.BindingSlotConsumerAspect,
                                                       ir.UpdateSlotAspect {
  slot: ir.DataSlot|null = null;

  constructor(readonly id: ir.Id, public name: string, public expression: o.Expression, public sourceSpan: ParseSourceSpan|null) {
    super();
  }

  visitExpressions(visitor: o.ExpressionVisitor, ctx: any): void {
    this.expression = this.expression.visitExpression(visitor, ctx);
  }

  countUpdateBindingsUsed(): number {
    if (this.expression instanceof InterpolationExpr) {
      return this.expression.expressions.length;
    } else {
      return 1;
    }
  }
}

export class PropertyEmitter implements ir.UpdateEmitter {
  emit(node: ir.UpdateNode): o.Statement|null {
    if (!(node instanceof Property)) {
      return null;
    }
    const name = o.literal(node.name);
    if (node.expression instanceof InterpolationExpr) {
      return emitInterpolationExpr(node.expression, PROPERTY_INTERPOLATION_CONFIG, [name], node.sourceSpan);
    } else {
      return o.importExpr(R3.property).callFn([name, node.expression], node.sourceSpan).toStmt();
    }
  }
}

const PROPERTY_INTERPOLATION_CONFIG: InterpolationConfig = {
  name: 'propertyInterpolate',
  expressionCountSpecificInstruction: [
    R3.propertyInterpolate,
    R3.propertyInterpolate1,
    R3.propertyInterpolate2,
    R3.propertyInterpolate3,
    R3.propertyInterpolate4,
    R3.propertyInterpolate5,
    R3.propertyInterpolate6,
    R3.propertyInterpolate7,
    R3.propertyInterpolate8,
  ],
  varExpressionCountInstruction: R3.propertyInterpolateV,
};
