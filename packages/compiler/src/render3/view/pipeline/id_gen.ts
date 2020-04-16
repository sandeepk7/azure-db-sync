/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Id, IdGen} from './ir/create';

export class IdGenerator implements IdGen {
  private _nextId: number = 0;

  next(): Id {
    return this._nextId++ as Id;
  }
}
