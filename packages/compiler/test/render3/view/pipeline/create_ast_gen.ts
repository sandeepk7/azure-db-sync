/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {IdGenerator} from '@angular/compiler/src/render3/view/pipeline/id_gen';

import {createElement, createElementEnd, createElementStart} from '../../../../src/render3/view/pipeline/element';
import * as cir from '../../../../src/render3/view/pipeline/ir/create';
import {LinkedList} from '../../../../src/render3/view/pipeline/ir/linked_list';
import {createText} from '../../../../src/render3/view/pipeline/text';

export abstract class CreateAstGenBase {
  protected _gen = new IdGenerator();
  protected _list = new LinkedList<cir.Node>();

  node(node: cir.Node) {
    this._list.append(node);
  }

  transform(transform: cir.Transform<any>): void {
    this._list.applyTransform(transform);
  }

  build(): cir.Node[] {
    return this._list.toArray();
  }
}

export class HostCreateAstGen {}

export class TemplateCreateAstGen extends CreateAstGenBase {
  text(value: string|null): cir.Id {
    const instruction = createText(this._gen.next(), value);
    this._list.append(instruction);
    return instruction.id;
  }

  elementStart(tag: string, attrs?: any[]|null): cir.Id {
    const instruction = createElementStart(this._gen.next(), tag, attrs);
    this._list.append(instruction);
    return instruction.id;
  }

  element(tag: string, attrs?: any[]|null): cir.Id {
    const instruction = createElement(this._gen.next(), tag, attrs);
    this._list.append(instruction);
    return instruction.id;
  }

  elementEnd(id: cir.Id): void {
    const instruction = createElementEnd(id);
    this._list.append(instruction);
  }
}
