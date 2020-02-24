
/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as cir from '../../api/cir';
import * as uir from '../../api/uir';
import * as o from '../../../../../output/output_ast';
import {CreateEmitter, UpdateEmitter} from '../../api/output';

export class UnsupportedCreateEmitter implements CreateEmitter {
  emit(node: cir.Node): o.Statement|null {
    throw new Error(`Unsupported node kind: ${node.kind}`);
  }
}

export class UnsupportedUpdateEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    throw new Error(`Unsupported node kind: ${node.kind}`);
  }
}
