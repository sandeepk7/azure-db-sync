/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {Element, ElementStart} from '../../../../../src/render3/view/pipeline/ir/create';
import {ConstantAllocatorTransform} from '../../../../../src/render3/view/pipeline/stages/constant_allocator';
import {TemplateAstGen} from '../util';

describe('stages constant allocator transformation', () => {
  it('should chain together multiple repeated instances of an instruction', () => {
    const builder = new TemplateAstGen();
    const id = builder.elementStart('div', ['id', 'bar']);
    builder.element('div', ['title', 'foo']);
    builder.elementEnd(id);

    const allocator = new ConstantAllocatorTransform();
    builder.transform(allocator);

    const elements = builder.build();

    const divElement1 = elements[0] as ElementStart;
    expect(divElement1.tag).toEqual('div');
    expect(divElement1.attrs).toEqual(0);

    const divElement2 = elements[1] as Element;
    expect(divElement2.tag).toEqual('div');
    expect(divElement2.attrs).toEqual(1);

    const attrs = allocator.getConstants();
    expect(attrs).toEqual([
      ['id', 'bar'],
      ['title', 'foo'],
    ]);
  });
});
