/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {RootTemplate} from '../ir/api';
import * as cir from '../ir/create';

import {BaseTemplateStage} from './base';

export class TemplateNameStage extends BaseTemplateStage<TemplateNameTransform, never> {
  makeCreateTransform(
      root: RootTemplate, prev: TemplateNameTransform|null, parent: cir.Template|null) {
    let parentName: string;
    if (parent !== null && parent.functionName !== null) {
      parentName = parent.functionName;
    } else {
      parentName = root.name !;
    }

    return new TemplateNameTransform(parentName);
  }

  makeUpdateTransform(): null { return null; }
}

export class TemplateNameTransform implements cir.Transform {
  constructor(private parentName: string) {}

  visit(node: cir.Node): cir.Node {
    if (node.kind !== cir.Kind.Template) {
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
