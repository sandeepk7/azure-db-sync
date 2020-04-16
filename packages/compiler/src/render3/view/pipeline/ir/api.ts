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

export class RootTemplate {
  create: cir.List;
  update: uir.List;
  scope: Scope;

  constructor(create: cir.List, update: uir.List, scope: Scope) {
    this.create = create;
    this.update = update;
    this.scope = scope;
  }

  name: string|null = null;
  consts: o.Expression[]|null = null;

  decls: number|null = null;
  vars: number|null = null;

  transform(...stages: TemplateStage[]): void {
    for (const stage of stages) {
      stage.transform(this);
    }
  }
}

export class Host {
  create = new cir.List();
  update = new uir.List();
  attrs: o.Expression[]|null = null;

  decls: number|null = null;
  vars: number|null = null;

  constructor(public name: string) {}

  transform(...stages: HostStage[]): void {
    for (const stage of stages) {
      stage.transform(this);
    }
  }
}

export interface TemplateStage {
  transform(tmpl: RootTemplate): void;
}
export interface HostStage {
  transform(host: Host): void;
}

export enum TargetKind {
  Reference,
  Variable,
  RootContext,
  Event,
}

export interface Reference extends cir.Reference {
  kind: TargetKind.Reference;
}

export interface Variable {
  kind: TargetKind.Variable;
  template: cir.Id;
  value: string;
}

export interface RootContext {
  kind: TargetKind.RootContext;
}

export interface Event {
  kind: TargetKind.Event;
}

export type Target = Reference|Variable|RootContext|Event;

export interface Scope {
  readonly targets: IterableIterator<[string, Target]>;
  readonly parent: Scope|null;

  lookup(name: string): Target;

  getChild(id: cir.Id): Scope;
}
