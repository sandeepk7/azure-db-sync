/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../../src/output/output_ast';
import {Identifiers as R3} from '../../../../../../src/render3/r3_identifiers';
import {Predicate, TestableInstruction} from '../../helpers/cursor';
import {TestableTemplateFn} from '../../helpers/template';
import {ParseSourceSpan} from '../../../../../../src/parse_util';

export function styleMapProperty():
    Predicate<TestableInstruction, TestableStylingProperty, TestableTemplateFn> {
  return new StyleMapPredicate();
}

export function stylePropProperty(name: string):
    Predicate<TestableInstruction, TestableStylingProperty, TestableTemplateFn> {
  return new StylePropertyPredicate(name);
}

export function classMapProperty():
    Predicate<TestableInstruction, TestableStylingProperty, TestableTemplateFn> {
  return new ClassMapPredicate();
}

export function classPropProperty(name: string):
    Predicate<TestableInstruction, TestableStylingProperty, TestableTemplateFn> {
  return new ClassPropertyPredicate(name);
}

export interface TestableStylingProperty {
  propName: string|null;
  expressions: o.Expression[];
  instruction: o.ExternalReference;
  sourceSpan: ParseSourceSpan|null;
  chained: boolean;
}

abstract class StylingPredicateBase implements Predicate<TestableInstruction, TestableStylingProperty, TestableTemplateFn> {
  apply(inst: TestableInstruction): TestableStylingProperty|null {
    return this.isInstructionPermitted(inst)
      ? this.getTestableProperty(inst)
      : null;
  }

  abstract isInstructionPermitted(inst: TestableInstruction): boolean;
  abstract getTestableProperty(inst: TestableInstruction): TestableStylingProperty;
  abstract toString(): string;
}

class StyleMapPredicate extends StylingPredicateBase {
  private _permittedInstructions = new Set<o.ExternalReference>([
    R3.styleMap,
    R3.styleMapInterpolate1,
    R3.styleMapInterpolate2,
    R3.styleMapInterpolate3,
    R3.styleMapInterpolate4,
    R3.styleMapInterpolate5,
    R3.styleMapInterpolate6,
    R3.styleMapInterpolate7,
    R3.styleMapInterpolate8,
    R3.styleMapInterpolateV,
  ]);

  isInstructionPermitted(inst: TestableInstruction): boolean {
    return this._permittedInstructions.has(inst.instruction);
  }

  getTestableProperty(inst: TestableInstruction): TestableStylingProperty {
    return {
      propName: null,
      expressions: inst.args,
      instruction: inst.instruction,
      sourceSpan: inst.sourceSpan,
      chained: inst.chained,
    };
  }

  toString(): string {
    return `[style]`;
  }
}

class StylePropertyPredicate extends StylingPredicateBase {
  private _permittedInstructions = new Set<o.ExternalReference>([
    R3.styleProp,
    R3.stylePropInterpolate1,
    R3.stylePropInterpolate2,
    R3.stylePropInterpolate3,
    R3.stylePropInterpolate4,
    R3.stylePropInterpolate5,
    R3.stylePropInterpolate6,
    R3.stylePropInterpolate7,
    R3.stylePropInterpolate8,
    R3.stylePropInterpolateV,
  ]);

  constructor(private _name: string) {
    super();
  }

  isInstructionPermitted(inst: TestableInstruction): boolean {
    return this._permittedInstructions.has(inst.instruction);
  }

  getTestableProperty(inst: TestableInstruction): TestableStylingProperty {
    return {
      propName: this._name,
      expressions: inst.args.slice(1),
      instruction: inst.instruction,
      sourceSpan: inst.sourceSpan,
      chained: inst.chained,
    };
  }

  toString(): string {
    return `[style.${this._name}]`;
  }
}

class ClassMapPredicate extends StylingPredicateBase {
  private _permittedInstructions = new Set<o.ExternalReference>([
    R3.classMap,
    R3.classMapInterpolate1,
    R3.classMapInterpolate2,
    R3.classMapInterpolate3,
    R3.classMapInterpolate4,
    R3.classMapInterpolate5,
    R3.classMapInterpolate6,
    R3.classMapInterpolate7,
    R3.classMapInterpolate8,
    R3.classMapInterpolateV,
  ]);

  isInstructionPermitted(inst: TestableInstruction): boolean {
    return this._permittedInstructions.has(inst.instruction);
  }

  getTestableProperty(inst: TestableInstruction): TestableStylingProperty {
    return {
      propName: null,
      expressions: inst.args,
      instruction: inst.instruction,
      sourceSpan: inst.sourceSpan,
      chained: inst.chained,
    };
  }

  toString(): string {
    return `[class]`;
  }
}

class ClassPropertyPredicate extends StylingPredicateBase {
  constructor(private _name: string) {
    super();
  }

  isInstructionPermitted(inst: TestableInstruction): boolean {
    return inst.instruction === R3.classProp;
  }

  getTestableProperty(inst: TestableInstruction): TestableStylingProperty {
    return {
      propName: this._name,
      expressions: inst.args,
      instruction: inst.instruction,
      sourceSpan: inst.sourceSpan,
      chained: inst.chained,
    };
  }

  toString(): string {
    return `[class.${this._name}]`;
  }
}
