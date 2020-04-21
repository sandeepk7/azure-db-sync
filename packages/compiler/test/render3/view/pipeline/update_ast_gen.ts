/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../src/output/output_ast';
import {createClassMap, createClassProp} from '../../../../src/render3/view/pipeline/class';
import * as cir from '../../../../src/render3/view/pipeline/ir/create';
import * as uir from '../../../../src/render3/view/pipeline/ir/update';
import {LinkedList} from '../../../../src/render3/view/pipeline/linked_list';
import {createProperty} from '../../../../src/render3/view/pipeline/property';
import {createStyleMap, createStyleProp} from '../../../../src/render3/view/pipeline/style';

export abstract class UpdateAstGenBase {
  protected _list = new LinkedList<uir.Node>();
  private _id: cir.Id = 0 as cir.Id;

  transform(transform: uir.Transform): void {
    this._list.applyTransform(transform);
  }

  property(name: string, value: string|null|o.LiteralExpr) {
    const property = createProperty(this._id, name, value);
    this._list.append(property);
  }

  styleProp(prop: string, binding: o.LiteralExpr) {
    const property = createStyleProp(this._id, name, binding);
    this._list.append(property);
  }

  styleMap(binding: o.LiteralExpr) {
    const property = createStyleMap(this._id, binding);
    this._list.append(property);
  }

  classProp(prop: string, binding: o.LiteralExpr) {
    const property = createClassProp(this._id, name, binding);
    this._list.append(property);
  }

  classMap(binding: o.LiteralExpr) {
    const property = createClassMap(this._id, binding);
    this._list.append(property);
  }

  build(): uir.Node[] {
    return this._list.toArray();
  }
}

export class HostUpdateAstGen extends UpdateAstGenBase {}

export class TemplateUpdateAstGen extends UpdateAstGenBase {}
