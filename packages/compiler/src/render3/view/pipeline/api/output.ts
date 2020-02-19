/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as o from '../../../../output/output_ast';

import * as cir from './cir';
import * as uir from './uir';

export interface Driver {
  emitCreationInstruction(node: cir.Node): o.Statement|null;
  emitUpdateInstruction(node: uir.Node): o.Statement|null;
}
