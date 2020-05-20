/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
