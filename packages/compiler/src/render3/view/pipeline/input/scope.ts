/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import * as cir from '../ir/create';

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
const ROOT_CONTEXT: RootContext = {
  kind: TargetKind.RootContext,
};

export type Target = Reference | Variable | RootContext;

export class Scope {
  private _targets = new Map<string, Target>();
  private children = new Map<cir.Id, Scope>();

  constructor(private idGen: IdGenerator, readonly parent: Scope|null) {}

  allocateId(): cir.Id { return this.idGen.next(); }

  recordReference(name: string, toElementId: cir.Id, value: string): void {
    this._targets.set(name, {
      kind: TargetKind.Reference,
      element: toElementId, value,
    });
  }

  recordVariable(name: string, templateId: cir.Id, value: string): void {
    this._targets.set(name, {
      kind: TargetKind.Variable,
      template: templateId, value,
    });
  }

  get targets(): IterableIterator<[string, Target]> { return this._targets.entries(); }

  lookup(name: string): Target {
    if (this._targets.has(name)) {
      return this._targets.get(name) !;
    } else if (this.parent !== null) {
      return this.parent.lookup(name);
    } else {
      return ROOT_CONTEXT;
    }
  }

  static root(): Scope { return new Scope(new IdGenerator(), /* parent */ null); }

  child(id: cir.Id): Scope {
    const childScope = new Scope(this.idGen, this);
    this.children.set(id, childScope);
    return childScope;
  }

  getChild(id: cir.Id): Scope {
    if (!this.children.has(id)) {
      throw new Error(`AssertionError: unknown child scope for CirId(${id})`);
    }
    return this.children.get(id) !;
  }
}

class IdGenerator {
  private id = 0;

  next(): cir.Id { return this.id++ as cir.Id; }
}
