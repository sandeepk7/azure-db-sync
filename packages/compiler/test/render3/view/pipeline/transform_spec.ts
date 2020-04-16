/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ElementStart, Kind} from '../../../../src/render3/view/pipeline/ir/create';
import {TemplateAstGen} from './util';

describe('', () => {
  describe('elements', () => {
    it('should produce a series of element start/end instructions', () => {
      const list = new TemplateAstGen();
      const section = list.elementStart('section');
      const div = list.elementStart('div');
      list.elementEnd(div);
      list.elementEnd(section);

      const result = list.build();
      expect(result[0].kind).toEqual(Kind.ElementStart);
      expect((result[0] as ElementStart).tag).toEqual('section');

      expect(result[1].kind).toEqual(Kind.ElementStart);
      expect((result[1] as ElementStart).tag).toEqual('div');

      expect(result[2].kind).toEqual(Kind.ElementEnd);
      expect(result[3].kind).toEqual(Kind.ElementEnd);
    });
  });
});
