/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../src/output/output_ast';
import * as cir from './ir/create';
import {NodeKind, StyleMap, StyleProp} from './ir/update';

// TODO (matsko): move to a testing directory
export function createStyleProp(id: cir.Id, name: string, expression: o.Expression): StyleProp {
  return {next: null, prev: null, kind: NodeKind.StyleProp, id, name, suffix: null, expression};
}

export function createStyleMap(id: cir.Id, expression: o.Expression): StyleMap {
  return {next: null, prev: null, kind: NodeKind.StyleMap, id, expression};
}
