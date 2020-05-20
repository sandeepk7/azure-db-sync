/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AdvanceEmitter, AdvanceStage} from '../../../../../../src/render3/view/pipeline/features/advance';
import {PropertyEmitter} from '../../../../../../src/render3/view/pipeline/features/binding';
import {SlotAllocatorStage} from '../../../../../../src/render3/view/pipeline/features/decls_vars';
import {ElementEmitter} from '../../../../../../src/render3/view/pipeline/features/element';

import {TestPipeline} from '../../helpers/template';
import {element} from '../element/helpers';

import {propertyNamed as boundProperty} from './helpers';


describe('property() instructions', () => {
  let testPipeline!: TestPipeline;
  beforeAll(() => {
    testPipeline = TestPipeline.setup(
        [new SlotAllocatorStage(), new AdvanceStage()],
        [new ElementEmitter()],
        [new PropertyEmitter(), new AdvanceEmitter()],
    );
  });

  it('emits property binding instructions for two nodes', () => {
    const res = testPipeline.fromHtml(`<div [a1]="a1" [a2]="a2"></div><div [b]="b"></div>`);

    const divA = res.create.expectSome(element('div'));
    const divB = res.create.expectSome(element('div'));

    const a1 = divA.update.expectNext(boundProperty('a1'));
    expect(a1.chained).toBeFalse();

    const a2 = divA.update.expectNext(boundProperty('a2'));
    expect(a2.chained).toBeTrue();
    divA.update.assertDone();

    divB.update.expectNext(boundProperty('b'));
    divB.update.assertDone();
  });
});
