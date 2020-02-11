/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {ElementId, CirNode, CirList, CirTransform} from "../../../../src/render3/view/pipeline/api";
import {createElementStart, createElementEnd, createElement} from "../../../../src/render3/view/pipeline/element";
import {createText} from "../../../../src/render3/view/pipeline/text";
import {IdGenerator} from "@angular/compiler/src/render3/view/pipeline/id_gen";

export interface TestAstGen {
  elementStart(tag: string): ElementId;
  elementEnd(id: ElementId): void;
  text(value: string): ElementId;
  build(): CirNode[];
}

export class TemplateAstGen implements TestAstGen {
  private _gen = new IdGenerator();
  private _list = new CirList();

  elementStart(tag: string): ElementId {
    const instruction = createElementStart(this._gen.next(), tag);
    this._list.append(instruction);
    return instruction.id;
  }

  element(tag: string): ElementId {
    const instruction = createElement(this._gen.next(), tag);
    this._list.append(instruction);
    return instruction.id;
  }

  elementEnd(id: ElementId): void {
    const instruction = createElementEnd(id);
    this._list.append(instruction);
  }

  text(value: string|null): ElementId {
    const instruction = createText(this._gen.next(), value);
    this._list.append(instruction);
    return instruction.id;
  }

  transform(transform: CirTransform): void {
    this._list.applyTransform(transform);
  }

  build(): CirNode[] {
    return this._list.toArray();
  }
}
