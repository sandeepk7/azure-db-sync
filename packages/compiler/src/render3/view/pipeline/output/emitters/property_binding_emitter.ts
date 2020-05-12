/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as uir from '../../ir/update';
import {UpdateEmitter} from '../api';
import {emitInterpolationExpr, InterpolationConfig} from './util';

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

export class PropertyBindingEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    if (node.kind !== uir.NodeKind.Property) {
      return null;
    }

    if (node.expression instanceof uir.EmbeddedExpression &&
        node.expression.value.kind === uir.ExpressionKind.Interpolation) {
      return emitInterpolationExpr(
          node.expression.value, PROPERTY_INTERPOLATION_CONFIG, [o.literal(node.name)]);
    } else {
      return o.importExpr(R3.property)
          .callFn([
            o.literal(node.name),
            node.expression,
          ])
          .toStmt();
    }
  }
}
