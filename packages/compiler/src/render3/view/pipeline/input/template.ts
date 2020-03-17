/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import * as ast from '../../../../expression_parser/ast';
import * as o from '../../../../output/output_ast';
import * as tmpl from '../../../r3_ast';
import {RootTemplate} from '../ir/api';
import * as cir from '../ir/create';
import * as uir from '../ir/update';

import {Scope} from './scope';
import {ReadResult, ReadResultKind, ValuePreprocessor, ValueProcessorHost} from './value';

export interface IrTemplate {
  create: cir.List;
  update: uir.List;
  scope: Scope;
}

export function parse(input: tmpl.Node[], name: string): RootTemplate {
  const root = TemplateToIrConverter.parseRoot(input);
  root.name = name;
  return root;
}

class TemplateToIrConverter implements tmpl.Visitor<void>, ast.AstVisitor, ValueProcessorHost {
  private create = new cir.List();
  private update = new uir.List();

  private preprocessor = new ValuePreprocessor(this);

  constructor(private scope: Scope) {}

  /**
   * Parse a template beginning from its top-level, including all sub-templates.
   */
  static parseRoot(input: tmpl.Node[]): RootTemplate {
    const parser = new TemplateToIrConverter(Scope.root());
    for (const node of input) {
      node.visit(parser);
    }
    return {
      ...parser.finalize(),
      attrs: null,
      name: null,
    };
  }

  /**
   * Parse a child template of a higher-level template, including all sub-templates.
   */
  private parseChild(id: cir.Id, input: tmpl.Template): IrTemplate {
    const childScope = this.scope.child(id);
    const parser = new TemplateToIrConverter(childScope);

    for (const v of input.variables) {
      childScope.recordVariable(v.name, id, v.value);
    }

    for (const node of input.children) {
      node.visit(parser);
    }

    return parser.finalize();
  }

  visitElement(element: tmpl.Element): void {
    // Allocate an id.
    const id = this.scope.allocateId();

    const elementStart: cir.ElementStart = {
      ...FRESH_NODE,
      kind: cir.Kind.ElementStart, id,
      slot: null,
      tag: element.name,
      attrs: null,
    };

    this.create.append(elementStart);

    for (const ref of element.references) {
      this.scope.recordReference(ref.name, id, ref.value);
    }

    if (element.attributes.length > 0 || element.inputs.length > 0) {
      elementStart.attrs = [];
      for (const attr of element.attributes) {
        elementStart.attrs.push(attr.name);
        elementStart.attrs.push(attr.value);
      }

      for (const input of element.inputs) {
        elementStart.attrs.push(input.name);
        elementStart.attrs.push('');
      }
    }

    tmpl.visitAll(this, element.children);

    this.create.append({
      ...FRESH_NODE,
      kind: cir.Kind.ElementEnd, id,
    });
  }

  visitText(text: tmpl.Text): void {
    const id = this.scope.allocateId();
    this.create.append({
      ...FRESH_NODE,
      kind: cir.Kind.Text, id,
      value: text.value,
      slot: null,
    });
  }

  visitBoundText(text: tmpl.BoundText): void {
    const id = this.scope.allocateId();
    this.create.append({
      ...FRESH_NODE,
      kind: cir.Kind.Text, id,
      value: null,
      slot: null,
    });

    let top = text.value;
    if (top instanceof ast.ASTWithSource) {
      top = top.ast;
    }

    if (top instanceof ast.Interpolation) {
      this.update.append({
        ...FRESH_NODE,
        kind: uir.NodeKind.TextInterpolate, id,
        text: top.strings,
        expression: top.expressions.map(e => this.preprocessor.process(e)),
      });
    } else {
      console.error(top);
      throw new Error('??');
    }
  }

  visitTemplate(template: tmpl.Template): void {
    const id = this.scope.allocateId();
    const parsed = this.parseChild(id, template);

    for (const ref of template.references) {
      this.scope.recordReference(ref.name, id, ref.value);
    }

    this.create.append({
      ...FRESH_NODE,
      kind: cir.Kind.Template, id,
      create: parsed.create,
      update: parsed.update,
      slot: null,
    });
  }

  visitContent(content: tmpl.Content): void { throw new Error('Method not implemented.'); }
  visitVariable(variable: tmpl.Variable): void { throw new Error('Method not implemented.'); }
  visitReference(reference: tmpl.Reference): void { throw new Error('Method not implemented.'); }
  visitTextAttribute(attribute: tmpl.TextAttribute): void {
    throw new Error('Method not implemented.');
  }
  visitBoundAttribute(attribute: tmpl.BoundAttribute): void {
    throw new Error('Method not implemented.');
  }
  visitBoundEvent(attribute: tmpl.BoundEvent): void { throw new Error('Method not implemented.'); }
  visitIcu(icu: tmpl.Icu): void { throw new Error('Method not implemented.'); }

  finalize(): IrTemplate {
    return {
      create: this.create,
      update: this.update,
      scope: this.scope,
    };
  }


  visitBinary(ast: ast.Binary, context: any) { throw new Error('Method not implemented.'); }
  visitChain(ast: ast.Chain, context: any) { throw new Error('Method not implemented.'); }
  visitConditional(ast: ast.Conditional, context: any) {
    throw new Error('Method not implemented.');
  }
  visitFunctionCall(ast: ast.FunctionCall, context: any) {
    throw new Error('Method not implemented.');
  }
  visitImplicitReceiver(ast: ast.ImplicitReceiver, context: any) {
    throw new Error('Method not implemented.');
  }
  visitInterpolation(ast: ast.Interpolation, context: any) {
    throw new Error('Method not implemented.');
  }
  visitKeyedRead(ast: ast.KeyedRead, context: any) { throw new Error('Method not implemented.'); }
  visitKeyedWrite(ast: ast.KeyedWrite, context: any) { throw new Error('Method not implemented.'); }
  visitLiteralArray(ast: ast.LiteralArray, context: any) {
    throw new Error('Method not implemented.');
  }
  visitLiteralMap(ast: ast.LiteralMap, context: any) { throw new Error('Method not implemented.'); }
  visitLiteralPrimitive(ast: ast.LiteralPrimitive, context: any) {
    throw new Error('Method not implemented.');
  }
  visitMethodCall(ast: ast.MethodCall, context: any) { throw new Error('Method not implemented.'); }
  visitPipe(ast: ast.BindingPipe, context: any) { throw new Error('Method not implemented.'); }
  visitPrefixNot(ast: ast.PrefixNot, context: any) { throw new Error('Method not implemented.'); }
  visitNonNullAssert(ast: ast.NonNullAssert, context: any) {
    throw new Error('Method not implemented.');
  }
  visitPropertyRead(ast: ast.PropertyRead, context: any) {
    throw new Error('Method not implemented.');
  }
  visitPropertyWrite(ast: ast.PropertyWrite, context: any) {
    throw new Error('Method not implemented.');
  }
  visitQuote(ast: ast.Quote, context: any) { throw new Error('Method not implemented.'); }
  visitSafeMethodCall(ast: ast.SafeMethodCall, context: any) {
    throw new Error('Method not implemented.');
  }
  visitSafePropertyRead(ast: ast.SafePropertyRead, context: any) {
    throw new Error('Method not implemented.');
  }
}

const FRESH_NODE = {
  next: null,
  prev: null,
};
