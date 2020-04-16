/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {IdGenerator} from '@angular/compiler/src/render3/view/pipeline/id_gen';
import * as o from '../../../../src/output/output_ast';

import {createElement, createElementEnd, createElementStart} from '../../../../src/render3/view/pipeline/element';
import * as cir from '../../../../src/render3/view/pipeline/ir/create';
import * as uir from '../../../../src/render3/view/pipeline/ir/update';
import {LinkedList} from '../../../../src/render3/view/pipeline/linked_list';
import {createText} from '../../../../src/render3/view/pipeline/text';
import {createProperty} from '../../../../src/render3/view/pipeline/property';

export interface TestAstGen {
  node(node: cir.Node): void;
  element(tag: string): cir.Id;
  elementStart(tag: string): cir.Id;
  elementEnd(id: cir.Id): void;
  text(value: string): cir.Id;
  property(name: string, value: string): void;
  build(): cir.Node[];
  buildUpdateNodes(): uir.Node[];
}

export class TemplateCreateAstGen implements TestAstGen {
  private _gen = new IdGenerator();
  private _list = new LinkedList<cir.Node>();

  node(node: cir.Node) { this._list.append(node); }

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

  property(name: string, value: string|null|o.LiteralExpr): Id {
    const instruction = createProperty(name, value);
    this._list.append(instruction);
    return instruction.id;
  }

  transform(transform: Transform<any>): void { this._list.applyTransform(transform); }

  build(): cir.Node[] { return this._list.toArray(); }
}
