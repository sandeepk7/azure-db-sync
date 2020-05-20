/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../src/output/output_ast';

export interface Cursor<T> {
  next(): T|null;
  clone(): Cursor<T>;
}

export class EmptyCursor<T> implements Cursor<T> {
  next(): T|null {
    return null;
  }

  clone(): EmptyCursor<T> {
    return this;
  }
}

export class StatementCursor implements Cursor<o.Statement> {
  private nextIndex = 0;

  constructor(private statements: o.Statement[]) {}

  next(): o.Statement|null {
    if (this.nextIndex >= this.statements.length) {
      return null;
    }
    return this.statements[this.nextIndex++];
  }

  clone(): StatementCursor {
    const copy = new StatementCursor(this.statements);
    copy.nextIndex = this.nextIndex;
    return copy;
  }
}

export class InstructionCursor implements Cursor<TestableInstruction> {
  private chain: TestableInstruction[] = [];

  constructor(private statements: Cursor<o.Statement>) {}

  next(): TestableInstruction|null {
    while (this.chain.length === 0) {
      const stmt = this.statements.next();
      if (stmt === null) {
        return null;
      }

      if (stmt instanceof o.ExpressionStatement && stmt.expr instanceof o.InvokeFunctionExpr) {
        this.addChainedInstructions(stmt.expr);
      }
    }

    return this.chain.shift()!;
  }

  private addChainedInstructions(expr: o.InvokeFunctionExpr): o.ExternalReference {
    let instruction: o.ExternalReference;
    let chained: boolean = false;

    // Either expr.fn is an o.ExternalExpr (the first instruction in a chain), or another
    // o.InvokeFunctionExpr.
    if (expr.fn instanceof o.InvokeFunctionExpr) {
      // This is a chained call. The actual instruction is determined by the call being chained.
      instruction = this.addChainedInstructions(expr.fn);
      chained = true;
    } else if (expr.fn instanceof o.ExternalExpr) {
      // This is the outermost (first) call.
      instruction = expr.fn.value;
    } else {
      throw new Error(`Unknown format chained call: o.${expr.constructor.name}`);
    }

    this.chain.push(new TestableInstruction(instruction, expr.args, chained));

    return instruction;
  }

  clone(): InstructionCursor {
    const copy = new InstructionCursor(this.statements.clone());
    copy.chain = [...this.chain];
    return copy;
  }
}

export class TestableInstruction {
  constructor(
      readonly instruction: o.ExternalReference, readonly args: o.Expression[],
      readonly chained: boolean) {}

  toString(): string {
    const args = this.args.map(arg => {
      if (arg instanceof o.LiteralExpr) {
        if (typeof arg.value === 'number' || typeof arg.value === 'boolean' || arg.value === null ||
            arg.value === undefined) {
          return `${arg.value}`;
        } else if (typeof arg.value === 'string') {
          return `'${arg.value}'`;
        }
      }
      return '...';
    });
    return `[Instruction: ${this.instruction.name}(${args.join(', ')})]`;
  }
}

export interface Predicate<T, V, C> {
  apply(value: T, cursor: Cursor<T>, ctx: C): V|null;
  toString(): string;
}

export class PredicateCursor<T, V, C> implements Cursor<V> {
  constructor(
      private delegate: Cursor<T>,
      private predicate: Predicate<T, V, C>,
      private ctx: C,
  ) {}

  next(): V|null {
    let next: T|null;
    while ((next = this.delegate.next()) !== null) {
      const res = this.predicate.apply(next, this.delegate, this.ctx);
      if (res !== null) {
        return res;
      }
    }
    return null;
  }

  clone(): PredicateCursor<T, V, C> {
    return new PredicateCursor(this.delegate, this.predicate, this.ctx);
  }
}

export class AssertionCursor<T, C> implements Cursor<T> {
  constructor(private cursor: Cursor<T>, private ctx: C) {}

  next(): T|null {
    return this.cursor.next();
  }

  some<V>(predicate: Predicate<T, V, C>): V|null {
    let next: T|null;
    while ((next = this.cursor.next()) !== null) {
      const res = predicate.apply(next, this.cursor, this.ctx);
      if (res !== null) {
        return res;
      }
    }
    return null;
  }

  expectSome<V>(predicate: Predicate<T, V, C>): V {
    const res = this.some(predicate);
    if (res === null) {
      throw new Error(`Expected ${predicate}, but found end instead.`);
    }
    return res;
  }

  expectNext<V>(predicate: Predicate<T, V, C>): V {
    const next = this.next();
    if (next === null) {
      throw new Error(`Expected ${predicate}, but found end instead.`);
    }
    const res = predicate.apply(next, this.cursor, this.ctx);
    if (res === null) {
      throw new Error(`Expected ${predicate}, found ${next} instead`);
    }
    return res;
  }

  assertDone(): void {
    const next = this.next();
    if (next !== null) {
      throw new Error(`Expected end, found ${next} instead.`);
    }
  }

  clone(): AssertionCursor<T, C> {
    return new AssertionCursor(this.cursor.clone(), this.ctx);
  }
}
