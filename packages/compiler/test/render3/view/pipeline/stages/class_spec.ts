/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-class license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ClassMap, ClassProp, NodeKind} from '@angular/compiler/src/render3/view/pipeline/ir/update';

import * as o from '../../../../../src/output/output_ast';
import {ClassTransform} from '../../../../../src/render3/view/pipeline/stages/class';
import {TemplateUpdateAstGen} from '../update_ast_gen';

describe('class transformation stage', () => {
  describe('ClassTransform', () => {
    it('should convert class-based properties into ClassProp instructions', () => {
      const expression = o.literal('100px');

      const builder = new TemplateUpdateAstGen();
      builder.property('class.width', expression);
      builder.transform(new ClassTransform());

      const instructions = builder.build() as ClassProp[];
      expect(instructions.length).toBe(1);
      expect(instructions[0].kind).toBe(NodeKind.ClassProp);
      expect(instructions[0].name).toBe('width');
    });

    it('should convert class-based properties into ClassMap instructions', () => {
      const expression = o.literal(true);

      const builder = new TemplateUpdateAstGen();
      builder.property('class', expression);
      builder.transform(new ClassTransform());

      const instructions = builder.build() as ClassMap[];
      expect(instructions.length).toBe(1);
      expect(instructions[0].kind).toBe(NodeKind.ClassMap);
    });
  });
});
