/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as cir from '../api/cir';
import * as uir from '../api/uir';
import * as o from '../../../../output/output_ast';
import {Driver} from '../api/output';

export function emitCreationNode(node: cir.Node, drivers: Driver[]): o.Statement|null {
  for (let i = 0; i < drivers.length; i++) {
    const result = drivers[i].emitCreationInstruction(node);
    if (result) {
      return result;
    }
  }
  return null;
}

export function emitUpdateNode(node: uir.Node, drivers: Driver[]): o.Statement|null {
  for (let i = 0; i < drivers.length; i++) {
    const result = drivers[i].emitUpdateInstruction(node);
    if (result) {
      return result;
    }
  }
  return null;
}
