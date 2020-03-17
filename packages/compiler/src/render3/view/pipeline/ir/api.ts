/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import * as o from '../../../../output/output_ast';
import {Identifiers as R3} from '../../../r3_identifiers';
import * as cir from '../ir/create';
import * as uir from '../ir/update';

export interface RootTemplate {
  create: cir.List;
  update: uir.List;
  scope: Scope;

  name: string|null;
  attrs: o.Expression[]|null;
}

export enum TargetKind {
  Reference,
  Variable,
  RootContext,
}

export interface Reference {
  kind: TargetKind.Reference;
  element: cir.Id;
  value: string;
}

export interface Variable {
  kind: TargetKind.Variable;
  template: cir.Id;
  value: string;
}

export interface RootContext { kind: TargetKind.RootContext; }

export type Target = Reference | Variable | RootContext;

export interface Scope {
  readonly targets: IterableIterator<[string, Target]>;
  readonly parent: Scope|null;

  lookup(name: string): Target;

  getChild(id: cir.Id): Scope;
}
