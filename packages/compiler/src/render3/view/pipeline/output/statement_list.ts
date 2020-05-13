import * as o from '../../../../output/output_ast';

export interface StatementList {
  readonly statements: o.Statement[];

  append(stmt: o.Statement): void;
}

export class LinearStatementList {
  statements: o.Statement[] = [];

  append(stmt: o.Statement): void {
    this.statements.push(stmt);
  }
}
