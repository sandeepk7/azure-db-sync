/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleTransform} from '../../../../../src/render3/view/pipeline/stages/style';
import {TemplateUpdateAstGen} from '../update_ast_gen';
import * as o from '../../../../../src/output/output_ast';
import {NodeKind, StyleProp, StyleMap} from '@angular/compiler/src/render3/view/pipeline/ir/update';

describe('style transformation stage', () => {
  describe('StyleTransform', () => {
    it('should convert style-based properties into StyleProp instructions', () => {
      const expression = o.literal('100px');

      const builder = new TemplateUpdateAstGen();
      builder.property('style.width', expression);
      builder.transform(new StyleTransform());

      const instructions = builder.build() as StyleProp[];
      expect(instructions.length).toBe(1);
      expect(instructions[0].kind).toBe(NodeKind.StyleProp);
      expect(instructions[0].name).toBe('width');
    });

    it('should convert style-based properties into StyleMap instructions', () => {
      const expression = o.literal('100px');

      const builder = new TemplateUpdateAstGen();
      builder.property('style', expression);
      builder.transform(new StyleTransform());

      const instructions = builder.build() as StyleMap[];
      expect(instructions.length).toBe(1);
      expect(instructions[0].kind).toBe(NodeKind.StyleMap);
    });
  });
});
