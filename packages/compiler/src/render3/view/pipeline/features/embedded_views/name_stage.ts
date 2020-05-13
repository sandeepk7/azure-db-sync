/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';

import {Template} from './node';

export class TemplateNameStage extends ir.BaseTemplateStage<TemplateNameTransform, never> {
  makeCreateTransform(
      root: ir.RootTemplate, prev: TemplateNameTransform|null, parent: Template|null) {
    let parentName: string;
    if (parent !== null && parent.functionName !== null) {
      parentName = parent.functionName;
    } else {
      parentName = root.name!;
    }

    return new TemplateNameTransform(parentName);
  }

  makeUpdateTransform(): null {
    return null;
  }
}

export class TemplateNameTransform implements ir.CreateTransform {
  constructor(private parentName: string) {}

  visit(node: ir.CreateNode): ir.CreateNode {
    if (!(node instanceof Template)) {
      return node;
    }

    let functionName: string = this.parentName !== null ? this.parentName : '';
    if (node.tagName !== null) {
      functionName += '_' + node.tagName;
    }
    if (node.slot === null) {
      throw new Error(`AssertionError: no slot for ${node.id}`);
    }
    functionName += '_' + node.slot;
    node.functionName = functionName;

    return node;
  }
}
