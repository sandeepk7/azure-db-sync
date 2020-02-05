/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
export type ElementId = number & { __brand: '...' };

export const enum CreateIRKind {
  ElementStart,
  ElementEnd,
  Text,
  Chain,
}

export interface CirBase {
  next: CirNode|null;
  prev: CirNode|null;
}

export type CirNode = CirElementStart | CirElementEnd | CirText;

declare function cirElementStart(id: ElementId, tag: string): CirElementStart;

export interface CirElementStart extends CirBase {
  kind: CreateIRKind.ElementStart;
  tag: string;
  id: ElementId;
}

export interface CirElementEnd extends CirBase {
  kind: CreateIRKind.ElementEnd;
  id: ElementId;
}

export interface CirText extends CirBase {
  kind: CreateIRKind.Text;
  value: string|null;
  id: ElementId;
}

export abstract class CirList<T extends CirBase = CirNode> {
  head: T|null = null;
  tail: T|null = null;
}

export interface ElementIdGen {
  next(): ElementId;
}

export interface CirChain<T extends CirBase = CirNode> extends CirBase {
  kind: CreateIRKind.Chain;
  list: CirList<T>;
}
