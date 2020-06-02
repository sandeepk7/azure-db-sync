/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';

import {Advance} from './node';

export class AdvanceStage extends ir.BaseTemplateStage<never, AdvanceTransform> {
  makeCreateTransform(): null {
    return null;
  }

  makeUpdateTransform(): AdvanceTransform {
    return new AdvanceTransform();
  }
}

export class AdvanceTransform implements ir.UpdateTransform {
  private slotPointer: ir.DataSlot = (0 as ir.DataSlot);

  constructor() {}

  visit(node: ir.UpdateNode, list: ir.UpdateList): ir.UpdateNode {
    if (ir.hasSlotAspect(node)) {
      this.maybePrependAdvance(node, list);
    }
    return node;
  }

  private maybePrependAdvance(node: ir.UpdateNode&ir.UpdateSlotAspect, list: ir.UpdateList): void {
    const slot = node.slot;
    if (slot === null) {
      throw new Error(`AssertionError: node ${node.id} has unknown slot`);
    }
    const delta = slot - this.slotPointer;
    if (delta > 0) {
      list.insertBefore(node, new Advance(delta));
      this.slotPointer = slot;
    } else if (delta < 0) {
      throw new Error('Cannot advance() backwards?');
    }
  }
}
