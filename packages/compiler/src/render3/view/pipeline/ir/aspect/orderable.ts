/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Id, UpdateNode} from '../node';

export interface OrderableAspect {
  readonly id: Id;
  readonly priority: number;
}

export function hasOrderableAspect(node: UpdateNode): node is UpdateNode&OrderableAspect {
  return typeof (node as any).priority === 'number';
}
