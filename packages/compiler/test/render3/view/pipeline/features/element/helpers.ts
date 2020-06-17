/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../../src/output/output_ast';
import {ParseSourceSpan} from '../../../../../../src/parse_util';
import {Identifiers as R3} from '../../../../../../src/render3/r3_identifiers';
import {AssertionCursor, Cursor, EmptyCursor, Predicate, TestableInstruction} from '../../helpers/cursor';
import {TestableTemplateFn} from '../../helpers/template';
import {SlotCursor} from '../advance/helpers';

export function element(tag: string):
    Predicate<TestableInstruction, TestableElement, TestableTemplateFn> {
  return new ElementPredicate(tag);
}

class ElementPredicate implements
    Predicate<TestableInstruction, TestableElement, TestableTemplateFn> {
  constructor(private tag: string) {}

  apply(
      inst: TestableInstruction, cursor: Cursor<TestableInstruction>,
      templateFn: TestableTemplateFn): TestableElement|null {
    if ((inst.instruction !== R3.element && inst.instruction !== R3.elementStart) ||
        inst.args.length < 2) {
      return null;
    }
    const slotArg = inst.args[0];
    const tagArg = inst.args[1];
    if (!(slotArg instanceof o.LiteralExpr) || !(tagArg instanceof o.LiteralExpr) ||
        typeof slotArg.value !== 'number' || typeof tagArg.value !== 'string') {
      return null;
    }

    if (tagArg.value !== this.tag) {
      return null;
    }

    return new TestableElement(
        slotArg.value, tagArg.value, inst.instruction === R3.element, cursor.clone(), templateFn,
        inst.sourceSpan);
  }

  toString(): string {
    return `[element: <${this.tag}>]`;
  }
}

export class TestableElement {
  private _childrenCursor: AssertionCursor<TestableInstruction, TestableTemplateFn>|null = null;
  private _updateCursor: AssertionCursor<TestableInstruction, TestableTemplateFn>|null = null;

  constructor(
      readonly slot: number,
      readonly tag: string,
      readonly selfClose: boolean,
      private postElementCursor: Cursor<TestableInstruction>,
      private templateFn: TestableTemplateFn,
      readonly sourceSpan: ParseSourceSpan|null,
  ) {}

  get children(): AssertionCursor<TestableInstruction, TestableTemplateFn> {
    if (this._childrenCursor === null) {
      if (this.selfClose) {
        this._childrenCursor =
            new AssertionCursor(new EmptyCursor<TestableInstruction>(), this.templateFn);
      } else {
        this._childrenCursor = new AssertionCursor(
            new ElementChildrenCursor(this.postElementCursor.clone()), this.templateFn);
      }
    }

    return this._childrenCursor;
  }

  get update(): AssertionCursor<TestableInstruction, TestableTemplateFn> {
    if (this._updateCursor === null) {
      this._updateCursor = new AssertionCursor(
          new SlotCursor(this.templateFn.update.clone(), this.slot), this.templateFn);
    }
    return this._updateCursor!;
  }
}

class ElementChildrenCursor implements Cursor<TestableInstruction> {
  private level: number = 0;
  private closed: boolean = false;

  constructor(private postElementCursor: Cursor<TestableInstruction>) {}

  next(): TestableInstruction|null {
    if (this.closed) {
      return null;
    }

    let next: TestableInstruction|null;
    while ((next = this.postElementCursor.next()) !== null) {
      if (next.instruction === R3.elementStart) {
        this.level++;
      } else if (next.instruction === R3.elementEnd) {
        if (this.level === 0) {
          // This is the elementEnd() instruction for the current element. There are no more
          // children after this.
          this.closed = true;
          return null;
        }
        this.level--;
      } else if (this.level === 0) {
        return next;
      } else {
        // Skip this statement as it's contained within a nested element.
      }
    }
    return null;
  }

  clone(): ElementChildrenCursor {
    const copy = new ElementChildrenCursor(this.postElementCursor.clone());
    copy.level = this.level;
    copy.closed = this.closed;
    return copy;
  }
}
