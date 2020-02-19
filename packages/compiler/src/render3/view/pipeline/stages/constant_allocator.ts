/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {Element, ElementStart, Kind, List, Node, Transform} from '../api/cir';


/**
 * Converts various constant values into index values and populates a constant pool
 */
export class ConstantAllocatorTransform implements Transform {
  private _constants: any[] = [];

  visit(node: Node, list: List): Node {
    switch (node.kind) {
      // elementStart('div', CONSTANT)
      // element('div', CONSTANT)
      case Kind.ElementStart:
      case Kind.Element:
        this._convertElementAttrs(node as ElementStart | Element);
        break;
    }

    return node;
  }

  getConstants() { return this._constants; }

  /**
   * Converts the element.attrs into a constant
   */
  private _convertElementAttrs(node: ElementStart|Element) {
    if (node.attrs !== null && typeof node.attrs !== 'number') {
      const index = this._constants.length;
      this._constants.push(node.attrs);
      node.attrs = index;
    }
  }
}
