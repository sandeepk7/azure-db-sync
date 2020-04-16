/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {NodeKind, Property} from './ir/update';
import * as o from '../../../../src/output/output_ast';

export function createProperty(name: string, expressionOrValue: string | null | o.LiteralExpr): Property {
  const expression = expressionOrValue instanceof o.LiteralExpr ? expressionOrValue : o.literal(expressionOrValue);
  return {next: null, prev: null, kind: NodeKind.Property, name, expression};
}
