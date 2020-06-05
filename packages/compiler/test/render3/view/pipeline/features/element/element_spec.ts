/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PropertyEmitter} from '../../../../../../src/render3/view/pipeline/features/binding';
import {SlotAllocatorStage} from '../../../../../../src/render3/view/pipeline/features/decls_vars';
import {ElementEmitter} from '../../../../../../src/render3/view/pipeline/features/element';
import {StyleEmitter, StyleTemplateStage} from '../../../../../../src/render3/view/pipeline/features/styling';
import {TestPipeline} from '../../helpers/template';
import {element} from '../element/helpers';

describe('element creation', () => {
  let testPipeline!: TestPipeline;
  beforeAll(() => {
    testPipeline = TestPipeline.setup(
        [new SlotAllocatorStage(), new StyleTemplateStage()],
        [new ElementEmitter()],
        [new PropertyEmitter(), new StyleEmitter()],
    );
  });

  it('should create an element and produce a source map to it', () => {
    const res = testPipeline.fromHtml(`<div></div>`);
    const div = res.create.expectSome(element('div'));
    const {start, end} = div.sourceSpan!;
    expect(start.col).toEqual(0);
    expect(start.line).toEqual(0);
    expect(end.col).toEqual(11);
    expect(end.line).toEqual(0);
    expect(start.file.content).toEqual('<div></div>');
    div.update.assertDone();
  });
});
