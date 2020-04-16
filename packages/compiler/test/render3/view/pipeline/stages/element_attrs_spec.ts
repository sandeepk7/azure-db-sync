/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {AttributeMarker} from '../../../../../src/core';
import {Element} from '../../../../../src/render3/view/pipeline/ir/create';
import {ElementAttrsTransform} from '../../../../../src/render3/view/pipeline/stages/element_attrs';
import {TemplateCreateAstGen} from '../util';

describe('stages elementAttrs transformation', () => {
  it('should balance a series of key/value attributes into an ElementAttrs array', () => {
    const attrs = ['title', 'foo', 'class', 'one two three', 'style', 'width:200px; height:600px;'];

    const builder = new TemplateCreateAstGen();
    builder.element('div', attrs);
    builder.transform(new ElementAttrsTransform());

    const instructions = builder.build() as any as Element[];
    expect(instructions.length).toBe(1);

    const newAttrs = instructions[0].attrs;
    expect(newAttrs).toEqual([
      'title',
      'foo',
      AttributeMarker.Classes,
      'one',
      'two',
      'three',
      AttributeMarker.Styles,
      'width',
      '200px',
      'height',
      '600px',
    ]);
  });
});
