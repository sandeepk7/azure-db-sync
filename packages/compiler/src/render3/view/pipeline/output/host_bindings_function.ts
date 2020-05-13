/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler/src/constant_pool';

import * as o from '../../../../output/output_ast';
import {ListenerEmitter} from '../features/binding';
import {ClassEmitter, StyleEmitter} from '../features/styling';
import * as ir from '../ir';

import {produceBodyStatements, produceTemplateFunctionParams} from './util';

export function emitHostBindingsFunction(
    host: ir.Host, constantPool: ConstantPool): o.FunctionExpr {
  const createEmitters: ir.CreateEmitter[] = [
    new ListenerEmitter(host.name),
  ];
  const updateEmitters: ir.UpdateEmitter[] = [
    new StyleEmitter(),
    new ClassEmitter(),
  ];

  return o.fn(
      produceTemplateFunctionParams(),
      produceBodyStatements(host, createEmitters, updateEmitters),
      /* type */ undefined,
      /* sourceSpan */ undefined,
      `${host.name}_HostBindings`,
  );
}
