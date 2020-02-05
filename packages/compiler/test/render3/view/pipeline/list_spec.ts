/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {TemplateAstGen, listToArr} from './util';
import {CreateIRKind, CirElementStart, CirBase, CirNode, CirList} from '@angular/compiler/src/render3/view/pipeline/api';
import {createCirList, appendCirList} from '@angular/compiler/src/render3/view/pipeline/list';

describe('instructions list', () => {
  describe('append', () => {
    it('should add to the list', () => {
      const list = createCirList();
      appendCirList(list, createTestNode('one'));

      appendCirList(list, createTestNode('two'));
    });
  });
});

export function expectTestListList(list: CirList) {
  expect((listToArr(list) as CirTestNode[]).map(item => item.name));
}

export function expectList(list: CirList) {
  expect(listToArr(list));
}

function createTestNode(name: string): CirNode {
  return {next: null, prev: null, name} as any as CirNode;
}

interface CirTestNode extends CirBase {
  name: string;
}
