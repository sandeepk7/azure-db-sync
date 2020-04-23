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

export class SlotAllocatorStage extends BaseTemplateStage<SlotAllocatorTransform, never> {
  private slotMap = new Map<cir.Id, cir.DataSlot>();

  protected makeCreateTransform(
      root: RootTemplate,
      ): SlotAllocatorTransform {
    return new SlotAllocatorTransform(root, this.slotMap);
  }

  protected makeUpdateTransform(): null {
    return null;
  }
}

export class SlotAllocatorTransform implements cir.Transform {
  private slot = 0;

  constructor(
      private template: RootTemplate|cir.Template, private slotMap: Map<cir.Id, cir.DataSlot>) {}

  private allocateSlotFor(id: cir.Id): cir.DataSlot {
    if (this.slotMap.has(id)) {
      throw new Error('AssertionError: a slot has already been assigned for this element');
    }
    const slot = (this.slot++) as cir.DataSlot;
    this.slotMap.set(id, slot);
    return slot;
  }

  private allocateSlotsForReferences(refs: cir.Reference[]): void {
    for (const ref of refs) {
      ref.slot = (this.slot++) as cir.DataSlot;
    }
  }

  visit(node: cir.Node): cir.Node {
    switch (node.kind) {
      case cir.Kind.ElementStart:
      case cir.Kind.Element:
      case cir.Kind.Template:
        node.slot = this.allocateSlotFor(node.id);
        if (node.refs !== null && Array.isArray(node.refs)) {
          this.allocateSlotsForReferences(node.refs);
        }
        break;
      case cir.Kind.Text:
        node.slot = this.allocateSlotFor(node.id);
        break;
    }
    return node;
  }

  finalize(): void {
    this.template.decls = this.slot;
  }
}
