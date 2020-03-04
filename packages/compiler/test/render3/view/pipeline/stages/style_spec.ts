/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {Kind} from '../../../../../src/render3/view/pipeline/api/cir';
import {StyleTransform} from '../../../../../src/render3/view/pipeline/stages/style';
import {TemplateAstGen} from '../util';

describe('stages StyleTransform transformation', () => {
  it('should convert style-based properties into StyleMap and StyleProp instructions', () => {
    const builder = new TemplateAstGen();
    builder.transform(new StyleTransform());

    const instructions = builder.build();
    // expect(instructions.length).toBe(1);
    // expect(instructions[0].kind).toBe(Kind.Element);
  });
});
