/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParseSourceSpan} from '@angular/compiler/src/parse_util';

import {CompileDirectiveSummary} from '../../../../compile_metadata';
import * as o from '../../../../output/output_ast';
import {BindingParser} from '../../../../template_parser/binding_parser';
import {R3HostMetadata} from '../../api';
import {Host} from '../ir/api';
import * as cir from '../ir/create';
import * as uir from '../ir/update';

import {ValuePreprocessor} from './value';

export function fromHostDef(
    name: string, meta: R3HostMetadata, parser: BindingParser, span: ParseSourceSpan): Host {
  const host = new Host(name);
  const summary = makeHostSummary(meta);
  const valuePreprocessor = new ValuePreprocessor();
  buildAttributeInstructions(host, meta.attributes, span);
  buildPropertyInstructions(host, valuePreprocessor, parser, summary, span);
  buildListenerInstructions(host, valuePreprocessor, parser, summary, span);
  return host;
}

const FRESH_NODE = {
  prev: null,
  next: null,
};

function buildAttributeInstructions(
    host: Host, attrs: {[key: string]: o.Expression}, span: ParseSourceSpan) {
  for (const prop of Object.keys(attrs)) {
    const instruction: uir.Node = {
      ...FRESH_NODE,
      kind: uir.NodeKind.Attribute,
    };

    host.update.append(instruction);
  }
}

function buildPropertyInstructions(
    host: Host, valuePreprocessor: ValuePreprocessor, parser: BindingParser,
    summary: CompileDirectiveSummary, span: ParseSourceSpan): void {
  const properties = parser.createBoundHostProperties(summary, span);
  if (properties === null) {
    return;
  }

  for (let property of properties) {
    const instruction: uir.Node = {
      ...FRESH_NODE,
      kind: uir.NodeKind.Property,
      name: property.name,
      expression: valuePreprocessor.process(property.expression),
    };

    host.update.append(instruction);
  }
}

function buildListenerInstructions(
    host: Host, valuePreprocessor: ValuePreprocessor, parser: BindingParser,
    summary: CompileDirectiveSummary, span: ParseSourceSpan) {
  const listeners = parser.createDirectiveHostEventAsts(summary, span);
  if (listeners === null) {
    return;
  }

  for (let listener of listeners) {
    const instruction: cir.Node = {
      ...FRESH_NODE,
      kind: cir.Kind.Listener,
      eventName: listener.name,
      handler: valuePreprocessor.process(listener.handler),
    };

    host.create.append(instruction);
  }
}

function makeHostSummary(meta: R3HostMetadata) {
  // clang-format off
  return {
    // This is used by the BindingParser, which only deals with listeners and properties. There's no
    // need to pass attributes to it.
    hostAttributes: {},
    hostListeners: meta.listeners,
    hostProperties: meta.properties,
  } as CompileDirectiveSummary;
  // clang-format on
}
