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
import {CreateEmitter} from '../api';

export class ListenerEmitter implements CreateEmitter {
  constructor(private directiveName: string) {}

  emit(node: cir.Node): o.Statement|null {
    if (node.kind !== cir.Kind.Listener) {
      return null;
    }

    // ɵɵlistener()
    const listenerFn = createListenerExpression(node, this.directiveName);
    return o.importExpr(R3.listener)
        .callFn([
          o.literal(node.eventName),
          listenerFn,
        ])
        .toStmt();
  }
}

function createListenerExpression(node: cir.Listener, directiveName: string) {
  return o.fn(
      [
        new o.FnParam('$event'),
      ],
      [new o.ReturnStatement(node.handler)], undefined, undefined,
      `${directiveName}_${node.eventName}_HostBindingHandler`);
}
