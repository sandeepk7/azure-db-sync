/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../output/output_ast';
import * as cir from '../ir/create';
import * as uir from '../ir/update';

export interface Emitter<T> {
  emit(node: T): o.Statement|null;
}

export interface CreateEmitter extends Emitter<cir.Node> {}
export interface UpdateEmitter extends Emitter<uir.Node> {}
