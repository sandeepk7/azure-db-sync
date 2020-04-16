/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-class license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Host, HostStage} from '../ir/api';
import {ClassMap, ClassProp, List, Node, NodeKind, Property, Transform} from '../ir/update';

import {BaseTemplateStage} from './base';

export class ClassStage extends BaseTemplateStage<never, ClassTransform> {
  private classTransform = new ClassTransform();

  makeCreateTransform(): null {
    return null;
  }

  makeUpdateTransform(): ClassTransform {
    return this.classTransform;
  }
}

export class ClassHostStage implements HostStage {
  private classTransform: Transform = new ClassTransform();

  transform(host: Host): void {
    host.update.applyTransform(this.classTransform);
  }
}

export class ClassTransform implements Transform {
  visit(node: Node, list: List): Node {
    if (node.kind === NodeKind.Property && isClassProp(node.name)) {
      node = convertClassProperty(node);
    }
    return node;
  }
}

function isClassProp(name: string) {
  return name.substring(0, 5) === 'class';
}

function convertClassProperty(node: Property): ClassMap|ClassProp {
  return node.name === 'class' ? convertClassMapProperty(node) : convertClassPropProperty(node);
}

function convertClassMapProperty(node: Property): ClassMap {
  const {prev, next, expression} = node;
  return {kind: NodeKind.ClassMap, expression, next, prev};
}

function convertClassPropProperty(node: Property): ClassProp {
  const {prev, next, expression} = node;
  const name = extractClassPropName(node.name);
  return {kind: NodeKind.ClassProp, name, expression, next, prev};
}

function extractClassPropName(name: string): string {
  return name.match(/class.(\w+)/)![1];
}
