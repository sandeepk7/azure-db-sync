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
import {propertyNamed} from '../binding/helpers';

import {advance} from './helpers';

describe('advance() instructions', () => {
  let testPipeline!: TestPipeline;
  beforeEach(() => {
    testPipeline = TestPipeline.setup(
        [new SlotAllocatorStage(), new AdvanceStage()],
        [new ElementEmitter()],
        [new PropertyEmitter(), new AdvanceEmitter()],
    );
  });

  it('emits advance instructions between two nodes', () => {
    const res = testPipeline.fromHtml(`<div [a1]="a1" [a2]="a2"></div><div [b]="b"></div>`);

    res.update.expectNext(propertyNamed('a1'));
    res.update.expectNext(propertyNamed('a2'));
    const adv = res.update.expectNext(advance());
    expect(adv.implicit).toBe(true);
    res.update.expectNext(propertyNamed('b'));
    res.update.assertDone();
  });
});
