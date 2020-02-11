/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {TemplateAstGen} from '../util';
import {SlotAllocatorTransform} from '../../../../../src/render3/view/pipeline/stages/slot_allocator';

fdescribe('stages slotAllocator transformation', () => {
  it('should populate all elementStart, element and text instructions with slot values', () => {
    const builder = new TemplateAstGen();
    const start = builder.elementStart('div');
    builder.text('Middle');
    builder.element('span');
    builder.elementEnd(start);
    builder.transform(new SlotAllocatorTransform());

    const instructions = builder.build();
    expect(instructions.length).toBe(4);

    expect(instructions.map((e: any) => e.slot)).toEqual([0, 1, 2, undefined]);
  });
});
