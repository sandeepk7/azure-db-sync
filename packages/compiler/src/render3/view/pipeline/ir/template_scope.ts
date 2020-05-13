import {DataSlot} from './aspect/data_slot';
import {Id} from './node';

export enum TargetKind {
  Reference,
  Variable,
  RootContext,
  Event,
}

export interface Reference {
  kind: TargetKind.Reference;
  slot: DataSlot|null;
  name: string;
  value: string;
}

export interface Variable {
  kind: TargetKind.Variable;
  template: Id;
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

  getChild(id: Id): Scope;
}
