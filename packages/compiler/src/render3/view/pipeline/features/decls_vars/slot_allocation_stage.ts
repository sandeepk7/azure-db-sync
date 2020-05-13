/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';

export class SlotAllocatorStage extends ir.BaseTemplateStage<SlotAllocatorTransform, never> {
  private slotMap = new Map<ir.Id, ir.DataSlot>();

  protected makeCreateTransform(
      root: ir.RootTemplate,
      ): SlotAllocatorTransform {
    return new SlotAllocatorTransform(root, this.slotMap);
  }

  protected makeUpdateTransform(): null {
    return null;
  }
}

export class SlotAllocatorTransform implements ir.CreateTransform {
  private slot = 0;

  constructor(private template: ir.TemplateAspect, private slotMap: Map<ir.Id, ir.DataSlot>) {}

  private allocateSlotFor(id: ir.Id): ir.DataSlot {
    if (this.slotMap.has(id)) {
      throw new Error('AssertionError: a slot has already been assigned for this element');
    }
    const slot = (this.slot++) as ir.DataSlot;
    this.slotMap.set(id, slot);
    return slot;
  }

  visit(node: ir.CreateNode): ir.CreateNode {
    if (ir.hasSlotAspect(node)) {
      node.slot = this.allocateSlotFor(node.id);
      node.allocateExtraSlots(() => (this.slot++) as ir.DataSlot);
    }
    return node;
  }

  finalize(): void {
    this.template.decls = this.slot;
  }
}
