/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as o from '../../../../output/output_ast';
import {RootTemplate} from '../ir/api';
import {CreateEmitter, UpdateEmitter} from '../output/api';

import {ElementEmitter} from './emitters/element_output_driver';
import {TemplateEmitter} from './emitters/template_emitter';
import {TextOutputEmitter} from './emitters/text_output_driver';
import {UnsupportedCreateEmitter, UnsupportedUpdateEmitter} from './emitters/unsupported_output_driver';
import {produceBodyStatements, produceTemplateFunctionParams} from './util';

export function emitTemplateFunction(tpl: RootTemplate) {
  const createEmitters: CreateEmitter[] = [];
  const updateEmitters: UpdateEmitter[] = [];

  updateEmitters.push(new UnsupportedUpdateEmitter());

  createEmitters.push(
      new ElementEmitter(), new TextOutputEmitter(),
      new TemplateEmitter(createEmitters, updateEmitters), new UnsupportedCreateEmitter(), );

  return o.fn(
      produceTemplateFunctionParams(), produceBodyStatements(tpl, createEmitters, updateEmitters),
      undefined, undefined, tpl.name);
}
