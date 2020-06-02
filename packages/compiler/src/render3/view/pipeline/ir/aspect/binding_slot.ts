/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
  return typeof (node as any as BindingSlotConsumerAspect).countUpdateBindingsUsed === 'function';
}
