/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as o from '../../../../output/output_ast';
import {Emitter} from '../output/api';

export function emitNode<T>(node: T, emitters: Emitter<T>[]): o.Statement|null {
  for (let i = 0; i < emitters.length; i++) {
    const result = emitters[i].emit(node);
    if (result) {
      return result;
    }
  }
  return null;
}
