/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as o from '../../../../../output/output_ast';
import {Identifiers as R3Identifiers} from '../../../../r3_identifiers';
import * as cir from '../../ir/create';
import {CreateEmitter, UpdateEmitter} from '../api';
import {produceBodyStatements, produceTemplateFunctionParams} from '../util';

export class TemplateEmitter implements CreateEmitter {
  constructor(private _createEmitters: CreateEmitter[], private _updateEmitters: UpdateEmitter[]) {}

  emit(node: cir.Node): o.Statement|null {
    if (node.kind !== cir.Kind.Template) {
      return null;
    }

    // ɵɵtemplate()
    const templateFn = o.fn(
        produceTemplateFunctionParams(),
        produceBodyStatements(node, this._createEmitters, this._updateEmitters));

    return o.importExpr(R3Identifiers.templateCreate).callFn([templateFn]).toStmt();
  }
}
