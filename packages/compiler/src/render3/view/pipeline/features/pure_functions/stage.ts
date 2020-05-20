/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '../../../../../constant_pool';
import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';
import {PureFunctionExpr} from './expression';

export class PureFunctionStage extends ir.ExpressionOnlyTemplateStage {
  constructor(private constantPool: ConstantPool) {
    super();
  }

  visitLiteralArrayExpr(node: o.LiteralArrayExpr): o.Expression {
    let transformedNode =
        super.visitLiteralArrayExpr(node, /* ctx */ undefined) as o.LiteralArrayExpr;
    const {literalFactory: identifier, literalFactoryArguments: args} =
        this.constantPool.getLiteralFactory(transformedNode);
    return new PureFunctionExpr(identifier, args);
  }

  visitLiteralMapExpr(node: o.LiteralMapExpr): o.Expression {
    let transformedNode = super.visitLiteralMapExpr(node, /* ctx */ undefined) as o.LiteralMapExpr;
    const {literalFactory: identifier, literalFactoryArguments: args} =
        this.constantPool.getLiteralFactory(transformedNode);
    return new PureFunctionExpr(identifier, args);
  }
}
