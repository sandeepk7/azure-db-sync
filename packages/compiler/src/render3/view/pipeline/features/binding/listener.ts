import * as o from '../../../../../output/output_ast';
import {Identifiers as R3} from '../../../../r3_identifiers';
import * as ir from '../../ir';

export class Listener extends ir.CreateNode {
  constructor(public eventName: string, public handler: o.Expression) {
    super();
  }

  visitExpressions(visitor: o.ExpressionVisitor, ctx: any): void {
    this.handler.visitExpression(visitor, ctx);
  }
}

export class ListenerEmitter implements ir.CreateEmitter {
  constructor(private directiveName: string) {}

  emit(node: ir.CreateNode): o.Statement|null {
    if (!(node instanceof Listener)) {
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

function createListenerExpression(node: Listener, directiveName: string) {
  return o.fn(
      [
        new o.FnParam('$event'),
      ],
      [new o.ReturnStatement(node.handler)], undefined, undefined,
      `${directiveName}_${node.eventName}_HostBindingHandler`);
}
