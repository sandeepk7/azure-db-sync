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

export function propertyNamed(name: string):
    Predicate<TestableInstruction, TestableProperty, TestableTemplateFn> {
  return new PropertyPredicate(name);
}

const PROPERTY_INSTRUCTIONS = new Set<o.ExternalReference>([
  R3.property,
  R3.propertyInterpolate,
  R3.propertyInterpolate1,
  R3.propertyInterpolate2,
  R3.propertyInterpolate3,
  R3.propertyInterpolate4,
  R3.propertyInterpolate5,
  R3.propertyInterpolate6,
  R3.propertyInterpolate7,
  R3.propertyInterpolate8,
  R3.propertyInterpolateV,
]);

class PropertyPredicate implements
    Predicate<TestableInstruction, TestableProperty, TestableTemplateFn> {
  constructor(private name: string) {}

  apply(inst: TestableInstruction): TestableProperty|null {
    if (!PROPERTY_INSTRUCTIONS.has(inst.instruction) || inst.args.length < 2) {
      return null;
    }
    const arg = inst.args[0];
    if (!(arg instanceof o.LiteralExpr) || typeof arg.value !== 'string' ||
        arg.value !== this.name) {
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
    return `[Property binding: ${this.name}]`;
  }
}

export interface TestableProperty {
  name: string;
  expressions: o.Expression[];
  instruction: o.ExternalReference;
  chained: boolean;
}
