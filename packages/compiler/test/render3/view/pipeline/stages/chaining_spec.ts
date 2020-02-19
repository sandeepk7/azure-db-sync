/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {Chain, Element, ElementStart, Kind, Text} from '../../../../../src/render3/view/pipeline/api/cir';
import {ChainingTransform} from '../../../../../src/render3/view/pipeline/stages/chaining';
import {TemplateAstGen} from '../util';

fdescribe('stages chaining transformation', () => {
  it('should chain together multiple repeated instances of an instruction', () => {
    const builder = new TemplateAstGen();
    builder.text('one');
    builder.text('two');
    builder.text('three');

    builder.transform(new ChainingTransform());

    const instructions = builder.build();
    expect(instructions.length).toBe(1);

    const chainInstruction = instructions[0] as Chain<Text>;
    expect(chainInstruction.kind).toBe(Kind.Chain);

    const chainEntries = chainInstruction.list.toArray();
    expect(chainEntries[0].kind).toBe(Kind.Text);
    expect(chainEntries[0].value).toBe('one');

    expect(chainEntries[1].kind).toBe(Kind.Text);
    expect(chainEntries[1].value).toBe('two');

    expect(chainEntries[2].kind).toBe(Kind.Text);
    expect(chainEntries[2].value).toBe('three');
  });

  it('should chain together instructions adjacent to other instructions', () => {
    const builder = new TemplateAstGen();
    builder.text('one');
    builder.text('two');
    builder.element('div');
    builder.element('span');
    builder.text('three');
    builder.text('four');
    builder.text('five');
    builder.elementStart('section');
    builder.text('six');
    builder.text('seven');

    builder.transform(new ChainingTransform());

    const instructions = builder.build();
    expect(instructions.length).toBe(5);

    const textInstructions1 = instructions[0] as Chain<Text>;
    const elementInstructions = instructions[1] as Chain<Element>;
    const textInstructions2 = instructions[2] as Chain<Text>;
    const elementStartInstruction = instructions[3] as ElementStart;
    const textInstructions3 = instructions[4] as Chain<Text>;

    const texts1 = textInstructions1.list.toArray().map(t => t.value);
    const elements = elementInstructions.list.toArray().map(t => t.tag);
    const texts2 = textInstructions2.list.toArray().map(t => t.value);
    const texts3 = textInstructions3.list.toArray().map(t => t.value);

    expect(texts1).toEqual(['one', 'two']);
    expect(elements).toEqual(['div', 'span']);
    expect(texts2).toEqual(['three', 'four', 'five']);
    expect(elementStartInstruction.tag).toEqual('section');
    expect(texts3).toEqual(['six', 'seven']);
  });
});
