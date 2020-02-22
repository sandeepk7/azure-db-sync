import * as o from '../../../../../output/output_ast';

import {EmbeddedExpression, Expression, ExpressionKind} from './expression_ast';
import {Node, NodeKind} from './node_ast';


export function nodeToString(node: Node): string {
  switch (node.kind) {
    case NodeKind.TextInterpolate:
      const cases: string[] = [];
      for (let i = 0; i < node.expression.length; i++) {
        cases.push(`'${node.text[i]}'`);
        cases.push(astToString(node.expression[i]));
      }
      cases.push(`'${node.text[node.text.length - 1]}'`);
      return `TextInterpolate(${node.id}, [${cases.join(', ')}])`;
    case NodeKind.Var:
      const id = node.name !== null ? `'${node.name}'` : node.id;
      return `Var(${id}, ${astToString(node.value)})`;
    default:
      throw new Error('not handled');
  }
}

export function astToString(node: o.Expression): string {
  if (node instanceof o.ReadVarExpr) {
    return node.name !== null ? `ReadVar('${node.name}')` : 'ReadVar(unknown var)';
  } else if (node instanceof o.ReadPropExpr) {
    return `ReadProp(${astToString(node.receiver)}, '${node.name}')`;
  } else if (node instanceof EmbeddedExpression) {
    return `Embedded(${expressionToString(node.value)})`;
  } else if (node instanceof o.InvokeFunctionExpr) {
    return `Call(${astToString(node.fn)}, [${node.args.map(a => astToString(a)).join(', ')}])`;
  } else if (node instanceof o.ExternalExpr) {
    if (node.value.moduleName === '@angular/core') {
      return `ng.${node.value.name}`;
    } else {
      return `import(${node.value.moduleName}).${node.value.name}`;
    }
  } else if (node instanceof o.LiteralExpr) {
    if (typeof node.value === 'string') {
      return `'${node.value}'`;
    } else {
      return `${node.value}`;
    }
  } else {
    return `Unknown(${Object.getPrototypeOf(node).constructor.name})`;
  }
}

export function expressionToString(node: Expression): string {
  switch (node.kind) {
    case ExpressionKind.Unresolved:
      return `Unresolved(${node.name})`;
    case ExpressionKind.Var:
      return `Var(${node.id})`;
    case ExpressionKind.NextContext:
      return `NextContext(${node.jump})`;
    case ExpressionKind.Reference:
      return `Reference(${node.id}, '${node.value}')`;
    default:
      throw new Error(`Not handled: ${ExpressionKind[node.kind]}`);
  }
}
