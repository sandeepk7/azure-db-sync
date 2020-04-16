/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {BaseTemplateStage} from './base';
import {List, Node, NodeKind, Property, StyleMap, StyleProp, Transform} from '../ir/update';
import {HostStage, Host} from '../ir/api';

/*
export class OrderingStage extends BaseTemplateStage<never, anyj> {
  makeCreateTransform(): null {
    return null;
  }

  makeUpdateTransform(): StyleTransform {
    return this.styleTransform;
  }
}

export class OrderingHostStage implements HostStage {
  private styleTransform = new StyleTransform();

  transform(host: Host): void {
    host.update.applyTransform(this.styleTransform);
  }
}
*/

/**
 * <div [foo]="x" bar="y" [baz]="z">
 *
 * prop('foo')('baz');
 * attr('bar');
 */
export class OrderTransform implements Transform {
  visit(node: Node, list: List): Node {
    return node;
  }
}
