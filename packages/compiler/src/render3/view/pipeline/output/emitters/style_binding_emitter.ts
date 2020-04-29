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
import {emitInterpolationExpr} from './util';

export class StyleBindingEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    switch (node.kind) {
      case uir.NodeKind.StyleProp:
        // ɵɵstylePropInterpolateN()
        if (node.expression instanceof uir.InterpolationExpression) {
          return emitInterpolationExpr(getStylePropInstructionRef, node.expression);
        }

        const params: o.Expression[] = [
          o.literal(node.name),
          node.expression,
        ];

        if (node.suffix !== null) {
          params.push(o.literal(node.suffix));
        }

        // ɵɵstyleProp()
        return o.importExpr(R3.styleProp)
            .callFn(params)
            .toStmt();

      case uir.NodeKind.StyleMap:
        // ɵɵstyleMapInterpolateN()
        if (node.expression instanceof uir.InterpolationExpression) {
          return emitInterpolationExpr(getStyleMapInstructionRef, node.expression);
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

function getStyleMapInstructionRef(length: number) {
  switch (length) {
    case 1:
      return R3.styleMap;
    case 3:
      return R3.styleMapInterpolate1;
    case 5:
      return R3.styleMapInterpolate2;
    case 7:
      return R3.styleMapInterpolate3;
    case 9:
      return R3.styleMapInterpolate4;
    case 11:
      return R3.styleMapInterpolate5;
    case 13:
      return R3.styleMapInterpolate6;
    case 15:
      return R3.styleMapInterpolate7;
    case 17:
      return R3.styleMapInterpolate8;
    default:
      return R3.styleMapInterpolateV;
  }
}

function getStylePropInstructionRef(length: number) {
  switch (length) {
    case 1:
      return R3.styleProp;
    case 3:
      return R3.stylePropInterpolate1;
    case 5:
      return R3.stylePropInterpolate2;
    case 7:
      return R3.stylePropInterpolate3;
    case 9:
      return R3.stylePropInterpolate4;
    case 11:
      return R3.stylePropInterpolate5;
    case 13:
      return R3.stylePropInterpolate6;
    case 15:
      return R3.stylePropInterpolate7;
    case 17:
      return R3.stylePropInterpolate8;
    default:
      return R3.stylePropInterpolateV;
  }
}
