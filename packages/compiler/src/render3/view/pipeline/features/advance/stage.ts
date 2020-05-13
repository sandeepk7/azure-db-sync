/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';

import {Advance} from './node';

export class AdvanceStage extends ir.BaseTemplateStage<AdvanceStage, AdvanceTransform> implements
    ir.CreateTransform {
  private slotMap = new Map<ir.Id, ir.DataSlot>();

  makeCreateTransform(): AdvanceStage {
    this.slotMap.clear();
    return this;
  }

  makeUpdateTransform(): AdvanceTransform {
    return new AdvanceTransform(this.slotMap);
  }

  visit(node: ir.CreateNode): ir.CreateNode {
    if (ir.hasSlotAspect(node) && node.slot !== null) {
      this.slotMap.set(node.id, node.slot);
    }
    return node;
  }
}

type UpdateNodeWithId = ir.UpdateNode&{id: ir.Id};

export class AdvanceSlotTracker implements ir.CreateTransform {}

export class AdvanceTransform implements ir.UpdateTransform {
  private slotPointer: ir.DataSlot = (0 as ir.DataSlot);

  constructor(private slotMap: Map<ir.Id, ir.DataSlot>) {}

  private getSlot(id: ir.Id): ir.DataSlot {
    if (!this.slotMap.has(id)) {
      throw new Error('Could not find slot for element: ' + id);
    }
    return this.slotMap.get(id)!;
  }

  visit(node: ir.UpdateNode, list: ir.UpdateList): ir.UpdateNode {
    if (ir.hasSlotAspect(node)) {
      this.maybePrependAdvance(node, list);
    }
    return node;
  }

  private maybePrependAdvance(node: UpdateNodeWithId, list: ir.UpdateList): void {
    const slot = this.getSlot(node.id);
    const delta = slot - this.slotPointer;
    if (delta > 0) {
      list.insertBefore(node, new Advance(delta));
      this.slotPointer = slot;
    } else if (delta < 0) {
      throw new Error('Cannot advance() backwards?');
    }
  }
}
