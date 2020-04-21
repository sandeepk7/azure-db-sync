/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../src/output/output_ast';
import * as cir from './ir/create';

import {ClassMap, ClassProp, NodeKind} from './ir/update';

export function createClassProp(id: cir.Id, name: string, expression: o.Expression): ClassProp {
  return {next: null, prev: null, kind: NodeKind.ClassProp, id, name, expression};
}

export function createClassMap(id: cir.Id, expression: o.Expression): ClassMap {
  return {next: null, prev: null, kind: NodeKind.ClassMap, id, expression};
}
