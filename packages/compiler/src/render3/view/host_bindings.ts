/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool, DefinitionKind} from '../../constant_pool';
import * as core from '../../core';
import * as o from '../../output/output_ast';
import * as uir from './pipeline/api/uir';
import * as cir from './pipeline/api/cir';
import {LinkedList} from './pipeline/linked_list';
import {StyleTransform} from './pipeline/stages/style';
import {R3HostMetadata} from './api';
import {produceTemplateFunctionParams, produceBodyStatements} from './pipeline/output/template_function';
import {CreateEmitter, UpdateEmitter} from './pipeline/api/output';

const UPDATE_TRANSFORMS: uir.Transform[] = [
  new StyleTransform(),
];

export function createHostBindingsFunction(meta: R3HostMetadata): o.Expression|null {
  const transforms: uir.Transform[] = [
    new StyleTransform()
  ];

  const createList = new LinkedList() as cir.List;
  const updateList = new LinkedList() as uir.List;

  const createEmitters: CreateEmitter[] = [];
  const updateEmitters: UpdateEmitter[] = [];

  // build up the uir.list
  // run through each of the transforms
  // emit
  return emitHostBindingsFunction(createList, createEmitters, updateList, updateEmitters);
}

export function emitHostBindingsFunction(
  createList: cir.List | cir.Node[],
  createEmitters: CreateEmitter[],
  updateList: uir.List | uir.Node[],
  updateEmitters: UpdateEmitter[]) {

  const create = Array.isArray(createList) ? createList : createList.toArray();
  const update = Array.isArray(updateList) ? updateList : updateList.toArray();

  return o.fn(
    produceTemplateFunctionParams(),
    produceBodyStatements(create, createEmitters, update, updateEmitters));
}
