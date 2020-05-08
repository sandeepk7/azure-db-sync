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


export class ClassBindingEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    switch (node.kind) {
      // ɵɵclassProp()
      case uir.NodeKind.ClassProp:
        return o.importExpr(R3.classProp)
            .callFn([
              o.literal(node.name),
              node.expression,
            ])
            .toStmt();

      // ɵɵclassMap()
      case uir.NodeKind.ClassMap:
        if (node.expression instanceof uir.InterpolationExpression) {
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
