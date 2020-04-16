/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as cir from '../../ir/create';
import * as uir from '../../ir/update';
import {CreateEmitter, UpdateEmitter} from '../api';

export class TextNodeEmitter implements CreateEmitter {
  emit(node: cir.Node): o.Statement|null {
    switch (node.kind) {
      // ɵɵtext()
      case cir.Kind.Text:
        const args: o.Expression[] = [slot(node.slot!)];
        if (node.value !== null) {
          args.push(o.literal(node.value));
        }
        return o.importExpr(R3.text).callFn(args).toStmt();
    }

    return null;
  }

  emitUpdateInstruction(node: uir.Node): o.Statement|null {
    return null;
  }
}

export class TextInterpolateEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    if (node.kind !== uir.NodeKind.TextInterpolate) {
      return null;
    }

    const args = makeInterpolateArgs(node.text, node.expression);
    switch (node.expression.length) {
      case 1:
        if (node.text[0] === '' && node.text[1] === '') {
          return o.importExpr(R3.textInterpolate).callFn([node.expression[0]]).toStmt();
        } else {
          return o.importExpr(R3.textInterpolate1).callFn(args).toStmt();
        }
      case 2:
        return o.importExpr(R3.textInterpolate2).callFn(args).toStmt();
      case 3:
        return o.importExpr(R3.textInterpolate3).callFn(args).toStmt();
      case 4:
        return o.importExpr(R3.textInterpolate4).callFn(args).toStmt();
      case 5:
        return o.importExpr(R3.textInterpolate5).callFn(args).toStmt();
      case 6:
        return o.importExpr(R3.textInterpolate6).callFn(args).toStmt();
      case 7:
        return o.importExpr(R3.textInterpolate7).callFn(args).toStmt();
      case 8:
        return o.importExpr(R3.textInterpolate8).callFn(args).toStmt();
      default:
        return o.importExpr(R3.textInterpolateV).callFn([o.literalArr(args)]).toStmt();
    }
  }
}

function slot(index: number) {
  return o.literal(index);
}

function makeInterpolateArgs(text: string[], expressions: o.Expression[]): o.Expression[] {
  const args: o.Expression[] = [];
  for (let i = 0; i < expressions.length; i++) {
    args.push(o.literal(text[i]));
    args.push(expressions[i]);
  }
  args.push(o.literal(text[text.length - 1]));
  return args;
}
