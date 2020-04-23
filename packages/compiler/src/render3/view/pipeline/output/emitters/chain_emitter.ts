/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../output/output_ast';
import * as uir from '../../ir/update';
import {UpdateEmitter} from '../api';

export class ChainUpdateEmitter implements UpdateEmitter {
  constructor(private emitters: UpdateEmitter[]) {}

  emit(node: uir.Node): o.Statement|null {
    if (node.kind !== uir.NodeKind.Chain) {
      return null;
    }

    const firstChild = node.list.head!;
    let expr = this.emitChildAsCall(firstChild);
    if (expr === null) {
      return null;
    }

    for (let child = firstChild.next; child !== null; child = child.next) {
      const nextCallExpr = this.emitChildAsCall(child);
      if (nextCallExpr === null) {
        throw new Error(`Cannot include node of kind ${
            uir.NodeKind[child.kind]} in a chain as it was not emittable`);
      }
      expr = expr.callFn(nextCallExpr.args);
    }

    return expr.toStmt();
  }

  private emitChildAsCall(node: uir.Node): o.InvokeFunctionExpr|null {
    for (const emitter of this.emitters) {
      const result = emitter.emit(node);
      if (result === null) {
        continue;
      }

      if (!(result instanceof o.ExpressionStatement)) {
        throw new Error(`Cannot chain nodes of kind ${
            uir.NodeKind[node.kind]} as they do not produce ExpressionStatements.`);
      } else if (!(result.expr instanceof o.InvokeFunctionExpr)) {
        throw new Error(`Cannot include node of kind ${
            uir.NodeKind[node.kind]} in a chain as it did not produce an InvokeFunctionExpression`);
      }

      return result.expr;
    }

    return null;
  }
}
