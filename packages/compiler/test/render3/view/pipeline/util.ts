/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {IdGenerator} from '@angular/compiler/src/render3/view/pipeline/id_gen';

import {Transform} from '../../../../src/render3/view/pipeline/linked_list';
import {Id, Node} from '../../../../src/render3/view/pipeline/api/cir';
import {createElement, createElementEnd, createElementStart} from '../../../../src/render3/view/pipeline/element';
import {LinkedList} from '../../../../src/render3/view/pipeline/linked_list';
import {createText} from '../../../../src/render3/view/pipeline/text';

export interface TestAstGen {
  node(node: Node): void;
  element(tag: string): Id;
  elementStart(tag: string): Id;
  elementEnd(id: Id): void;
  text(value: string): Id;
  build(): Node[];
}

export class TemplateAstGen implements TestAstGen {
  private _gen = new IdGenerator();
  private _list = new LinkedList<Node>();

  node(node: Node) { this._list.append(node); }

  elementStart(tag: string, attrs?: any[]|null): Id {
    const instruction = createElementStart(this._gen.next(), tag, attrs);
    this._list.append(instruction);
    return instruction.id;
  }

  element(tag: string, attrs?: any[]|null): Id {
    const instruction = createElement(this._gen.next(), tag, attrs);
    this._list.append(instruction);
    return instruction.id;
  }

  elementEnd(id: Id): void {
    const instruction = createElementEnd(id);
    this._list.append(instruction);
  }

  text(value: string|null): Id {
    const instruction = createText(this._gen.next(), value);
    this._list.append(instruction);
    return instruction.id;
  }

  transform(transform: Transform<any>): void { this._list.applyTransform(transform); }

  build(): Node[] { return this._list.toArray(); }
}
