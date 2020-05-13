/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler/src/constant_pool';

import * as o from '../../../../output/output_ast';
import {AdvanceEmitter} from '../features/advance';
import {PropertyEmitter} from '../features/binding';
import {ElementEmitter} from '../features/element';
import {TemplateEmitter} from '../features/embedded_views';
import {ClassEmitter, StyleEmitter} from '../features/styling';
import {TextCreateEmitter, TextUpdateEmitter} from '../features/text';
import {VarEmitter} from '../features/tmp_variables';
import * as ir from '../ir';

import {produceBodyStatements, produceTemplateFunctionParams} from './util';

export function emitTemplateFunction(tpl: ir.RootTemplate, constantPool: ConstantPool) {
  const createEmitters: ir.CreateEmitter[] = [];
  const updateEmitters: ir.UpdateEmitter[] = [];

  updateEmitters.push(
      new VarEmitter(), new TextUpdateEmitter(), new AdvanceEmitter(), new ClassEmitter(),
      new StyleEmitter(), new PropertyEmitter());

  createEmitters.push(
      new ElementEmitter(), new TextCreateEmitter(),
      new TemplateEmitter(createEmitters, updateEmitters, constantPool));

  return o.fn(
      produceTemplateFunctionParams(), produceBodyStatements(tpl, createEmitters, updateEmitters),
      undefined, undefined, `${tpl.name}_Template`);
}
