/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression} from '../expression';
import {CreateNode, Id, UpdateNode} from '../node';

export type DataSlot = number&{__brand: 'DataSlot'};

export interface CreateSlotAspect {
  readonly id: Id;
  slot: DataSlot|null;

  allocateExtraSlots(allocate: () => DataSlot): void;
}
export interface UpdateSlotAspect {
  readonly id: Id;
  slot: DataSlot|null;
}

export function hasSlotAspect(node: CreateNode): node is CreateNode&CreateSlotAspect;
export function hasSlotAspect(node: UpdateNode): node is UpdateNode&UpdateSlotAspect;
export function hasSlotAspect(node: Expression): node is Expression&UpdateSlotAspect;
export function hasSlotAspect(node: CreateNode|UpdateNode|Expression): boolean {
  return (node as any).slot !== undefined;
}
