/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Identifiers as R3} from '../../../../../../src/render3/r3_identifiers';
import {PropertyEmitter} from '../../../../../../src/render3/view/pipeline/features/binding';
import {SlotAllocatorStage} from '../../../../../../src/render3/view/pipeline/features/decls_vars';
import {ElementEmitter} from '../../../../../../src/render3/view/pipeline/features/element';
import {ClassEmitter, ClassTemplateStage, StyleEmitter, StyleTemplateStage} from '../../../../../../src/render3/view/pipeline/features/styling';
import {TestPipeline} from '../../helpers/template';
import {element} from '../element/helpers';

import {classMapProperty as boundClassMap, classPropProperty as boundClassProperty, styleMapProperty as boundStyleMap, stylePropProperty as boundStyleProp} from './helpers';

describe('styling bindings', () => {
  let testPipeline!: TestPipeline;
  beforeEach(() => {
    testPipeline = TestPipeline.setup(
        [new SlotAllocatorStage(), new StyleTemplateStage(), new ClassTemplateStage()],
        [new ElementEmitter()],
        [new PropertyEmitter(), new StyleEmitter(), new ClassEmitter()],
    );
  });

  describe('[style]', () => {
    it('should emit style map instructions', () => {
      const res = testPipeline.fromHtml(`<div [style]="s"></div>`);
      const div = res.create.expectSome(element('div'));

      const prop = div.update.expectNext(boundStyleMap());
      expect(prop.instruction).toBe(R3.styleMap);

      div.update.assertDone();
    });

    it('should assign a source map to the binding', () => {
      const res = testPipeline.fromHtml(`<div [style]="s"></div>`);
      const div = res.create.expectSome(element('div'));
      const prop = div.update.expectNext(boundStyleMap());

      const {start, end} = prop.sourceSpan!;
      expect(start.col).toEqual(5);
      expect(start.line).toEqual(0);
      expect(end.col).toEqual(16);
      expect(end.line).toEqual(0);
      expect(start.file.content).toEqual(`<div [style]="s"></div>`);

      div.update.assertDone();
    });
  });

  describe('[style.prop]', () => {
    it('should emit style prop instructions', () => {
      const res = testPipeline.fromHtml(`<div [style.width]="w" [style.height]="h"></div>`);
      const div = res.create.expectSome(element('div'));

      const widthProp = div.update.expectNext(boundStyleProp('width'));
      expect(widthProp.instruction).toBe(R3.styleProp);

      const heightProp = div.update.expectNext(boundStyleProp('height'));
      expect(heightProp.instruction).toBe(R3.styleProp);

      div.update.assertDone();
    });

    it('should assign source maps to multiple bindings', () => {
      const res = testPipeline.fromHtml(`<div [style.width]="w" [style.height]="h"></div>`);
      const div = res.create.expectSome(element('div'));

      const widthProp = div.update.expectNext(boundStyleProp('width'));
      let {start, end} = widthProp.sourceSpan!;
      expect(start.col).toEqual(5);
      expect(start.line).toEqual(0);
      expect(end.col).toEqual(22);
      expect(end.line).toEqual(0);
      expect(start.file.content).toEqual(`<div [style.width]="w" [style.height]="h"></div>`);

      const heightProp = div.update.expectNext(boundStyleProp('height'));
      start = heightProp.sourceSpan!.start;
      end = heightProp.sourceSpan!.end;
      expect(start.col).toEqual(23);
      expect(start.line).toEqual(0);
      expect(end.col).toEqual(41);
      expect(end.line).toEqual(0);
      expect(start.file.content).toEqual(`<div [style.width]="w" [style.height]="h"></div>`);

      div.update.assertDone();
    });
  });

  describe('[class]', () => {
    it('should emit a class map instructions', () => {
      const res = testPipeline.fromHtml(`<div [class]="c"></div>`);
      const div = res.create.expectSome(element('div'));

      const prop = div.update.expectNext(boundClassMap());
      expect(prop.instruction).toBe(R3.classMap);

      div.update.assertDone();
    });

    it('should assign a source map to the binding', () => {
      const res = testPipeline.fromHtml(`<div [class]="c"></div>`);
      const div = res.create.expectSome(element('div'));
      const prop = div.update.expectNext(boundClassMap());

      const {start, end} = prop.sourceSpan!;
      expect(start.col).toEqual(5);
      expect(start.line).toEqual(0);
      expect(end.col).toEqual(16);
      expect(end.line).toEqual(0);
      expect(start.file.content).toEqual(`<div [class]="c"></div>`);

      div.update.assertDone();
    });
  });

  describe('[class.name]', () => {
    it('should emit class name instructions', () => {
      const res = testPipeline.fromHtml(`<div [class.one]="o" [class.two]="t"></div>`);
      const div = res.create.expectSome(element('div'));

      const oneProp = div.update.expectNext(boundClassProperty('one'));
      expect(oneProp.instruction).toBe(R3.classProp);

      const twoProp = div.update.expectNext(boundClassProperty('two'));
      expect(twoProp.instruction).toBe(R3.classProp);

      div.update.assertDone();
    });

    it('should assign source maps to multiple bindings', () => {
      const res = testPipeline.fromHtml(`<div [class.one]="o" [class.two]="t"></div>`);
      const div = res.create.expectSome(element('div'));

      const oneProp = div.update.expectNext(boundClassProperty('one'));
      let {start, end} = oneProp.sourceSpan!;
      expect(start.col).toEqual(5);
      expect(start.line).toEqual(0);
      expect(end.col).toEqual(20);
      expect(end.line).toEqual(0);
      expect(start.file.content).toEqual(`<div [class.one]="o" [class.two]="t"></div>`);

      const twoProp = div.update.expectNext(boundClassProperty('two'));
      start = twoProp.sourceSpan!.start;
      end = twoProp.sourceSpan!.end;
      expect(start.col).toEqual(21);
      expect(start.line).toEqual(0);
      expect(end.col).toEqual(36);
      expect(end.line).toEqual(0);
      expect(start.file.content).toEqual(`<div [class.one]="o" [class.two]="t"></div>`);

      div.update.assertDone();
    });
  });
});
