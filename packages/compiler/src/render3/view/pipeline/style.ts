/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {NodeKind, StyleProp, StyleMap} from './ir/update';
import * as o from '../../../../src/output/output_ast';

export function createStyleProp(name: string, expression: o.Expression): StyleProp {
  return {next: null, prev: null, kind: NodeKind.StyleProp, name, expression};
}

export function createStyleMap(expression: o.Expression): StyleMap {
  return {next: null, prev: null, kind: NodeKind.StyleMap, expression};
}
