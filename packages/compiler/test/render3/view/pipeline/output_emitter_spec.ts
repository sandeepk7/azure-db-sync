/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../src/output/output_ast';
import {emitTemplateFunction} from '../../../../src/render3/view/pipeline/output/template_function';

import {TemplateAstGen} from './util';

describe('output instructions', () => {
  describe('elements', () => {
    fit('should emit various element instructions in the creation block', () => {
      const builder = new TemplateAstGen();
      const e1 = builder.elementStart('div');
      const e2 = builder.elementStart('div');
      builder.element('div', ['title', 'foo']);
      builder.elementEnd(e2);
      builder.elementEnd(e1);

      const result = builder.build();
      const output = emitTemplateFunction(result, []);

      const ifStmts = output.statements as o.IfStmt[];
      expect(ifStmts.length).toEqual(1);  // if (CREATE)

      const statements = ifStmts[0].trueCase as o.ExpressionStatement[];
      expect(statements.length).toEqual(5);
      expect(statements.length).toEqual(5);

      const [s1, s2, s3, s4, s5] = statements;
      expectOutputFunctionName(s1).toEqual('ɵɵelementStart');
      expectOutputFunctionName(s2).toEqual('ɵɵelementStart');

      expectOutputFunctionName(s3).toEqual('ɵɵelement');
      expectOutputFunctionArgs(s3).toEqual([null, 'div', ['title', 'foo']]);

      expectOutputFunctionName(s4).toEqual('ɵɵelementEnd');
      expectOutputFunctionName(s5).toEqual('ɵɵelementEnd');
    });
  });

  describe('text', () => {
    it('should emit various text() instructions', () => {
      const builder = new TemplateAstGen();
      builder.text('foo');
      builder.text('bar');
      builder.text('baz');

      const result = builder.build();
      const output = emitTemplateFunction(result, []);

      const statements = output.statements as o.ExpressionStatement[];
      expect(statements.length).toEqual(3);

      const [s1, s2, s3] = statements;

      expectOutputFunctionName(s1).toEqual('ɵɵtext');
      expectOutputFunctionArgs(s1).toEqual([null, 'foo']);

      expectOutputFunctionName(s2).toEqual('ɵɵtext');
      expectOutputFunctionArgs(s2).toEqual([null, 'bar']);

      expectOutputFunctionName(s3).toEqual('ɵɵtext');
      expectOutputFunctionArgs(s3).toEqual([null, 'baz']);
    });
  });
});

function expectOutputFunctionName(statement: o.ExpressionStatement) {
  const expr = statement.expr as o.InvokeFunctionExpr;
  const fn = expr.fn as o.ExternalExpr;
  return expect(fn.value.name);
}

function expectOutputFunctionArgs(statement: o.ExpressionStatement) {
  const expr = statement.expr as o.InvokeFunctionExpr;
  const args = expr.args as o.LiteralExpr[];
  return expect(args.map(a => literalToValue(a)));
}

function literalToValue(item: o.LiteralExpr | o.LiteralArrayExpr): any|any[] {
  if (item instanceof o.LiteralArrayExpr) {
    return item.entries.map(e => literalToValue(e as o.LiteralExpr | o.LiteralArrayExpr));
  }
  return item.value;
}
