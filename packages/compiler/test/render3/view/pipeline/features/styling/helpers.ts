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

export function styleMapProperty():
    Predicate<TestableInstruction, TestableStyleProperty, TestableTemplateFn> {
  return new StyleMapPredicate();
}

export function stylePropProperty(name: string):
    Predicate<TestableInstruction, TestableStyleProperty, TestableTemplateFn> {
  return new StylePropertyPredicate(name);
}

const STYLE_MAP_INSTRUCTIONS = new Set<o.ExternalReference>([
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

class StyleMapPredicate implements
    Predicate<TestableInstruction, TestableStyleProperty, TestableTemplateFn> {
  apply(inst: TestableInstruction): TestableStyleProperty|null {
    if (!STYLE_MAP_INSTRUCTIONS.has(inst.instruction)) {
      return null;
    }
    return {
      name: null,
      expressions: inst.args.slice(1),
      instruction: inst.instruction,
      chained: inst.chained,
    };
  }

  toString(): string {
    return `[STYLE]`;
  }
}

const STYLE_PROP_INSTRUCTIONS = new Set<o.ExternalReference>([
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

class StylePropertyPredicate implements
    Predicate<TestableInstruction, TestableStyleProperty, TestableTemplateFn> {
  constructor(private name: string) {}

  apply(inst: TestableInstruction): TestableStyleProperty|null {
    if (!STYLE_PROP_INSTRUCTIONS.has(inst.instruction)) {
      return null;
    }
    return {
      name: this.name,
      expressions: inst.args.slice(1),
      instruction: inst.instruction,
      chained: inst.chained,
    };
  }

  toString(): string {
    return `[STYLE]`;
  }
}

export interface TestableStyleProperty {
  name: string|null;
  expressions: o.Expression[];
  instruction: o.ExternalReference;
  chained: boolean;
}
