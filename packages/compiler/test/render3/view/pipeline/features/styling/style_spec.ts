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
import {styleMapProperty as boundStyleMap, stylePropProperty as boundStyleProp} from './helpers';
import {Identifiers as R3} from '../../../../../../src/render3/r3_identifiers';

describe('style bindings', () => {
  let testPipeline!: TestPipeline;
  beforeAll(() => {
    testPipeline = TestPipeline.setup(
        [new SlotAllocatorStage(), new StyleTemplateStage()],
        [new ElementEmitter()],
        [new PropertyEmitter(), new StyleEmitter()],
    );
  });

  describe('[style]', () => {
    fit('emits property binding instructions for two nodes', () => {
      const res = testPipeline.fromHtml(`<div [style]="s"></div>`);
      const div = res.create.expectSome(element('div'));
      const prop = div.update.expectNext(boundStyleMap());
      expect(prop.instruction).toBe(R3.styleMap);
      div.update.assertDone();
    });
  });

  describe('[style.prop]', () => {
    it('emits property binding instructions for two nodes', () => {
      const res = testPipeline.fromHtml(`<div [style.width]="w" [style.height]="h"></div>`);
      const div = res.create.expectSome(element('div'));
      const widthProp = div.update.expectNext(boundStyleProp('width'));
      expect(widthProp.instruction).toBe(R3.styleProp);
      const heightProp = div.update.expectNext(boundStyleProp('height'));
      expect(heightProp.instruction).toBe(R3.styleProp);
      div.update.assertDone();
    });
  });
});
