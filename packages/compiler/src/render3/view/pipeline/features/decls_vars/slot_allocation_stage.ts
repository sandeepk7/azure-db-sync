/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../../output/output_ast';
import * as ir from '../../ir';

export class SlotAllocatorStage extends
    ir.BaseTemplateStage<SlotAllocatorTransform, SlotCopyTransform> {
  private slotMap = new Map<ir.Id, ir.DataSlot>();

  protected makeCreateTransform(
      root: ir.RootTemplate,
      ): SlotAllocatorTransform {
    return new SlotAllocatorTransform(root, this.slotMap);
  }

  protected makeUpdateTransform(): SlotCopyTransform {
    return new SlotCopyTransform(this.slotMap);
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

export class SlotCopyTransform implements ir.UpdateTransform {
  private expressionTransform = new SlotCopyExpressionTransform(this.slotMap);

  constructor(private slotMap: Map<ir.Id, ir.DataSlot>) {}

  visit(node: ir.UpdateNode): ir.UpdateNode {
    if (ir.hasSlotAspect(node) && this.slotMap.has(node.id)) {
      node.slot = this.slotMap.get(node.id)!;
    }
    node.visitExpressions(this.expressionTransform);
    return node;
  }
}

export class SlotCopyExpressionTransform extends ir.ExpressionTransformer {
  constructor(private slotMap: Map<ir.Id, ir.DataSlot>) {
    super();
  }

  visitIrExpression(expr: ir.Expression): o.Expression {
    expr.visitChildren(this);
    if (ir.hasSlotAspect(expr) && this.slotMap.has(expr.id)) {
      expr.slot = this.slotMap.get(expr.id)!;
    }
    return expr;
  }
}
