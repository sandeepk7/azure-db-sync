/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Id, Kind, Text} from './ir/create';

export function createText(id: number, value: string|null): Text {
  return {next: null, prev: null, kind: Kind.Text, id: id as Id, value, slot: null};
}
