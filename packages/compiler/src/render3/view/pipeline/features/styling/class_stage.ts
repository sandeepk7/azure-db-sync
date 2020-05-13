/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-class license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
import {Property} from '../binding/property';
import {ClassMap, ClassProp} from './class';

export class ClassTemplateStage extends ir.BaseTemplateStage<never, ClassTransform> {
  private classTransform = new ClassTransform();

  makeCreateTransform(): null {
    return null;
  }

  makeUpdateTransform(): ClassTransform {
    return this.classTransform;
  }
}

export class ClassHostStage implements ir.HostStage {
  private classTransform = new ClassTransform();

  transform(host: ir.Host): void {
    host.update.applyTransform(this.classTransform);
  }
}

export class ClassTransform implements ir.UpdateTransform {
  visit(node: ir.UpdateNode): ir.UpdateNode {
    if (node instanceof Property && isClassProp(node.name)) {
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
  const {prev, next, id, expression, slot} = node;
  const newNode = new ClassMap(id, expression).withPrevAndNext(prev, next);
  newNode.slot = slot;
  return newNode;
}

function convertClassPropProperty(node: Property): ClassProp {
  const {prev, next, id, expression, slot} = node;
  const name = extractClassPropName(node.name);
  const newNode = new ClassProp(id, name, expression).withPrevAndNext(prev, next);
  newNode.slot = slot;
  return newNode;
}

function extractClassPropName(name: string): string {
  return name.match(/class.(\w+)/)![1];
}
