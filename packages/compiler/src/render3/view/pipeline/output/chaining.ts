import * as o from '../../../../output/output_ast';
import {Identifiers as R3} from '../../../r3_identifiers';
import {StatementList} from './statement_list';

const CHAINS_TO_NEXT = new Map([
  [R3.property, R3.property],
  [R3.classProp, R3.classProp],
  [R3.styleProp, R3.styleProp],
]);

export class ChainingStatementList implements StatementList {
  statements: o.Statement[] = [];

  private nextChainInstruction: o.ExternalReference|null = null;

  append(stmt: o.Statement): void {
    const instruction = getInstructionFromStatement(stmt);

    if (this.nextChainInstruction === null || instruction === null ||
        this.nextChainInstruction !== instruction) {
      // Chaining this statement off of the previous is not possible.
      this.statements.push(stmt);
    } else {
      // This statement can be chained off of the previous.
      const prevStmt = this.statements[this.statements.length - 1];

      const prevCall = getCallFromStatementOrFail(prevStmt);
      const currCall = getCallFromStatementOrFail(stmt);

      // Replace the previous statement with a chained version that includes the current one.
      const newPrevStmt = prevCall.callFn(currCall.args, currCall.sourceSpan).toStmt();
      this.statements[this.statements.length - 1] = newPrevStmt;
    }

    if (instruction === null || !CHAINS_TO_NEXT.has(instruction)) {
      // Either the current statement is not an instruction invocation, or the instruction invoked
      // does not support chaining.
      this.nextChainInstruction = null;
    } else {
      // The current instruction is chainable to another instruction.
      this.nextChainInstruction = CHAINS_TO_NEXT.get(instruction)!;
    }
  }
}

function getCallFromStatementOrFail(stmt: o.Statement): o.InvokeFunctionExpr {
  if (!(stmt instanceof o.ExpressionStatement) || !(stmt.expr instanceof o.InvokeFunctionExpr)) {
    throw new Error(`AssertionError: statement is not a function call where expected`);
  }
  return stmt.expr;
}

function getInstructionFromStatement(stmt: o.Statement): o.ExternalReference|null {
  if (!(stmt instanceof o.ExpressionStatement)) {
    return null;
  }

  const expr = stmt.expr;

  if (!(expr instanceof o.InvokeFunctionExpr) || !(expr.fn instanceof o.ExternalExpr)) {
    return null;
  }

  return expr.fn.value;
}
