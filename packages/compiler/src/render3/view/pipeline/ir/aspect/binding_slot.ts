import {Expression} from '../expression';
import {UpdateNode} from '../node';

export interface BindingSlotConsumerAspect {
  countUpdateBindingsUsed(): number;
}

export interface BindingSlotOffsetAspect extends BindingSlotConsumerAspect {
  slotOffset: number|null;
}

export function hasBindingSlotAspect(node: Expression): node is Expression&BindingSlotOffsetAspect;
export function hasBindingSlotAspect(node: UpdateNode): node is UpdateNode&
    BindingSlotConsumerAspect;
export function hasBindingSlotAspect(node: UpdateNode|Expression): boolean {
  return typeof (node as any).countUpdateBindingsUsed === 'function';
}
