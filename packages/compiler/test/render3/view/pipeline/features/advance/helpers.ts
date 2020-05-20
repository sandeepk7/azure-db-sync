/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../../src/output/output_ast';
import {Identifiers as R3} from '../../../../../../src/render3/r3_identifiers';
import {Cursor, Predicate, TestableInstruction} from '../../helpers/cursor';
import {TestableTemplateFn} from '../../helpers/template';

export function advance(): Predicate<TestableInstruction, TestableAdvance, TestableTemplateFn> {
  return new AdvancePredicate();
}

class AdvancePredicate implements
    Predicate<TestableInstruction, TestableAdvance, TestableTemplateFn> {
  apply(inst: TestableInstruction): TestableAdvance|null {
    if (inst.instruction !== R3.advance) {
      return null;
    }
    if (inst.args.length === 0) {
      // advance()
      return {delta: 1, implicit: true};
    } else {
      // advance(n)
      const deltaArg = inst.args[0];
      if (!(deltaArg instanceof o.LiteralExpr) || typeof deltaArg.value !== 'number') {
        return null;
      }

      return {delta: deltaArg.value, implicit: false};
    }
  };
}

export interface TestableAdvance {
  readonly delta: number;
  readonly implicit: boolean;
}

export class SlotCursor implements Cursor<TestableInstruction> {
  private currentSlot = 0;

  constructor(private delegate: Cursor<TestableInstruction>, private targetSlot: number) {}

  next(): TestableInstruction|null {
    let next: TestableInstruction|null;
    while ((next = this.delegate.next()) !== null) {
      if (next.instruction === R3.advance) {
        if (next.args.length === 0) {
          // advance()
          this.currentSlot += 1;
        } else {
          // advance(delta)
          const deltaArg = next.args[0];
          if (!(deltaArg instanceof o.LiteralExpr) || typeof deltaArg.value !== 'number') {
            throw new Error(`Malformed advance()`);
          }
          this.currentSlot += deltaArg.value;
        }
      } else if (this.currentSlot === this.targetSlot) {
        return next;
      }
    }
    return null;
  }

  clone(): SlotCursor {
    const res = new SlotCursor(this.delegate.clone(), this.targetSlot);
    res.currentSlot = this.currentSlot;
    return res;
  }
}
