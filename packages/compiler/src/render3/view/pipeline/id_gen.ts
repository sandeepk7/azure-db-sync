import {ElementIdGen, ElementId} from "./api";

export class IdGenerator implements ElementIdGen {
  private _nextId: number = 0;

  next(): ElementId {
    return this._nextId++ as ElementId;
  }
}
