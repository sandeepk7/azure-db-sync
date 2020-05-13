/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
import {ElementEnd, ElementStart} from './node';

export class SelfClosingElementStage extends ir.CreateOnlyTemplateStage implements
    ir.CreateTransform {
  visit(node: ir.CreateNode, list: ir.CreateList): ir.CreateNode {
    if (!(node instanceof ElementStart)) {
      // Only interested in ElementStart nodes.
      return node;
    }

    if (node.next === null || !(node.next instanceof ElementEnd)) {
      // Only interested if followed by an ElementEnd.
      return node;
    }

    // Removing the next node is always safe.
    list.remove(node.next);
    return node.toSelfClosingElement().withPrevAndNext(node.prev, node.next);
  }
}
