/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {SlotAllocatorTransform} from '@angular/compiler/src/render3/view/pipeline/stages/slot_allocator';

import {parse} from '../../../../../src/render3/view/pipeline/input/template';
import * as cir from '../../../../../src/render3/view/pipeline/ir/create';
import * as uir from '../../../../../src/render3/view/pipeline/ir/update';
import {ExpressionTranslator} from '../../../../../src/render3/view/pipeline/stages/expressions';
import {ResolverStage} from '../../../../../src/render3/view/pipeline/stages/resolver';
import {SelfClosingElementTransform} from '../../../../../src/render3/view/pipeline/stages/self_close';
import {VarNamesStage} from '../../../../../src/render3/view/pipeline/stages/var_names';
import {VariableOptimizerStage} from '../../../../../src/render3/view/pipeline/stages/var_optimizer';
import {NestedUpdateTransform} from '../../../../../src/render3/view/pipeline/util/nested';
import {parseTemplate} from '../../../../../src/render3/view/template';

describe('template parsing', () => {
  xit('should work', () => {
    const {nodes} = parseTemplate(
        `<div #ref></div>
        <ng-template let-x>
          <div #ref2></div>
          <ng-template let-y>
            <ng-template><span>{{ref2}} {{x}}</span></ng-template>
          </ng-template>
        </ng-template>`,
        'ng://test');
    const tmpl = parse(nodes);
    new ResolverStage(tmpl.scope).transform(tmpl);
    new VariableOptimizerStage().transform(tmpl);

    // tmpl.create.applyTransform(new SelfClosingElementTransform());

    NestedUpdateTransform.apply(tmpl, () => new VarNamesStage());
    const slotter = SlotAllocatorTransform.forTemplateRoot();
    tmpl.create.applyTransform(slotter);
    NestedUpdateTransform.apply(tmpl, slotter.expressionTransform);
    new ExpressionTranslator().transform(tmpl);

    console.error('create:');
    console.error(tmpl.create.toString(cir.nodeToString));
    console.error('update:');
    console.error(tmpl.update.toString(uir.nodeToString));
    fail('...');
  });
});
