import {RootTemplate, TemplateStage} from '../ir/api';
import * as cir from '../ir/create';
import * as uir from '../ir/update';

import {BaseTemplateStage} from './base';

export class AdvanceStage extends BaseTemplateStage<AdvanceStage, AdvanceTransform> implements
    cir.Transform {
  private slotMap = new Map<cir.Id, cir.DataSlot>();

  makeCreateTransform(): AdvanceStage {
    this.slotMap.clear();
    return this;
  }

  makeUpdateTransform(): AdvanceTransform { return new AdvanceTransform(this.slotMap); }

  visit(node: cir.Node): cir.Node {
    switch (node.kind) {
      case cir.Kind.Element:
      case cir.Kind.ElementStart:
      case cir.Kind.Template:
      case cir.Kind.Text:
        if (node.slot !== null) {
          this.slotMap.set(node.id, node.slot);
        }
        break;
    }
    return node;
  }
}

type UirNodeWithId = uir.TextInterpolate;

export class AdvanceSlotTracker implements cir.Transform {}

export class AdvanceTransform implements uir.Transform {
  private slotPointer: cir.DataSlot = (0 as cir.DataSlot);

  constructor(private slotMap: Map<cir.Id, cir.DataSlot>) {}

  private getSlot(id: cir.Id): cir.DataSlot {
    if (!this.slotMap.has(id)) {
      throw new Error('Could not find slot for element: ' + id);
    }
    return this.slotMap.get(id) !;
  }

  visit(node: uir.Node, list: uir.List): uir.Node {
    switch (node.kind) {
      case uir.NodeKind.TextInterpolate:
        const slot = this.maybePrependAdvance(node, list);
        break;
    }
    return node;
  }

  private maybePrependAdvance(node: UirNodeWithId, list: uir.List): void {
    const slot = this.getSlot(node.id);
    const delta = slot - this.slotPointer;
    if (delta > 0) {
      list.insertBefore(node, {
        prev: null,
        next: null,
        kind: uir.NodeKind.Advance, delta,
      })
    } else if (delta < 0) {
      throw new Error('Cannot advance() backwards?');
    }
  }
}
