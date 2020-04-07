
/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as o from '../../../../../output/output_ast';
import * as cir from '../../ir/create';
import * as uir from '../../ir/update';
import {CreateEmitter, UpdateEmitter} from '../../output/api';

export class UnsupportedCreateEmitter implements CreateEmitter {
  emit(node: cir.Node): o.Statement|null {
    throw new Error(`Unsupported node kind: ${cir.Kind[node.kind]}`);
  }
}

export class UnsupportedUpdateEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    throw new Error(`Unsupported node kind: ${uir.NodeKind[node.kind]}`);
  }
}
