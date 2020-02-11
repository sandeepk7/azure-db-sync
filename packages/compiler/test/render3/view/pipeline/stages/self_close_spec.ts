/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {TemplateAstGen} from '../util';
import {CirKind} from '@angular/compiler/src/render3/view/pipeline/api';
import {SelfClosingElementTransform} from '../../../../../src/render3/view/pipeline/stages/self_close';

fdescribe('stages selfClose transformation', () => {
  it('should convert an pair of elementStart/elementEnd to an elementSelfClose instruction', () => {
    const builder = new TemplateAstGen();
    const start = builder.elementStart('div');
    builder.elementEnd(start);
    builder.transform(new SelfClosingElementTransform());

    const instructions = builder.build();
    expect(instructions.length).toBe(1);
    expect(instructions[0].kind).toBe(CirKind.Element);
  });
});
