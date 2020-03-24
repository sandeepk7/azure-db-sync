/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as o from '../../../../../output/output_ast';
import {Identifiers as R3Identifiers} from '../../../../r3_identifiers';
import * as uir from '../../ir/update';
import {CreateEmitter, UpdateEmitter} from '../api';
import {produceBodyStatements, produceTemplateFunctionParams} from '../util';

export class VarEmitter implements UpdateEmitter {
  emit(node: uir.Node): o.Statement|null {
    if (node.kind !== uir.NodeKind.Var) {
      return null;
    }
    if (node.name === null) {
      throw new Error(`Unsupported: unnamed variable ${node.id}`);
    }

    return o.variable(node.name).set(node.value).toConstDecl();
  }
}
