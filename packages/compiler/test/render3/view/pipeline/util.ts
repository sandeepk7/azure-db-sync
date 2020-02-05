/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {ElementId, CirNode, CirList} from "../../../../src/render3/view/pipeline/api";
import {createCirList, appendCirList} from "../../../../src/render3/view/pipeline/list";
import {createElementStart, createElementEnd} from "../../../../src/render3/view/pipeline/element";
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
  private _list = createCirList();

  elementStart(tag: string): ElementId {
    const instruction = createElementStart(this._gen.next(), tag);
    appendCirList(this._list, instruction);
    return instruction.id;
  }

  elementEnd(id: ElementId): void {
    const instruction = createElementEnd(id);
    appendCirList(this._list, instruction);
  }

  text(value: string|null): ElementId {
    const instruction = createText(this._gen.next(), value);
    appendCirList(this._list, instruction);
    return instruction.id;
  }

  build() {
    return listToArr(this._list);
  }
}

export function listToArr(list: CirList) {
  const arr: CirNode[] = [];
  let node = list.head;
  while (node !== null) {
    arr.push(node);
    node = node.next;
  }
  return arr;
}
