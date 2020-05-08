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

export class StyleBindingEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    switch (node.kind) {
      case uir.NodeKind.StyleProp:
        // ɵɵstylePropInterpolateN()
        if (node.expression instanceof uir.InterpolationExpression) {
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

      case uir.NodeKind.StyleMap:
        // ɵɵstyleMapInterpolateN()
        if (node.expression instanceof uir.InterpolationExpression) {
          return emitInterpolationExpr(node.expression, STYLE_MAP_INTERPOLATION_CONFIG);
        }

        // ɵɵstyleMap()
        return o.importExpr(R3.styleMap)
            .callFn([
              node.expression,
            ])
            .toStmt();
    }

    return null;
  }
}
