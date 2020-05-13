/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {hasTemplateAspect, TemplateAspect, TemplateAspectWithId} from './aspect/template';
import {ExpressionTransformer} from './expression';
import {CreateTransform, UpdateTransform} from './node';
import {RootTemplate, TemplateStage} from './root';

export abstract class BaseTemplateStage<CT extends CreateTransform, UT extends UpdateTransform>
    implements TemplateStage {
  protected abstract makeCreateTransform(
      root: RootTemplate, prev: CT|null, tmpl: TemplateAspectWithId|null): CT|null;
  protected abstract makeUpdateTransform(
      root: RootTemplate, prev: UT|null, tmpl: TemplateAspectWithId|null, create: CT|null): UT|null;

  private transformImpl(
      root: RootTemplate, tmpl: TemplateAspect, prevCreate: CT|null, prevUpdate: UT|null): void {
    const childNode = tmpl instanceof RootTemplate ? null : (tmpl as TemplateAspectWithId);
    const currCreate = this.makeCreateTransform(root, prevCreate, childNode);
    const currUpdate = this.makeUpdateTransform(root, prevUpdate, childNode, currCreate);

    if (currCreate !== null) {
      tmpl.create.applyTransform(currCreate);
    }
    if (currUpdate !== null) {
      tmpl.update.applyTransform(currUpdate);
    }

    for (let node = tmpl.create.head; node !== null; node = node.next) {
      if (hasTemplateAspect(node)) {
        this.transformImpl(root, node, currCreate, currUpdate);
      }
    }
  }

  transform(tmpl: RootTemplate): void {
    this.transformImpl(tmpl, tmpl, null, null);
  }
}

export class CreateOnlyTemplateStage extends BaseTemplateStage<CreateTransform, never> {
  makeCreateTransform(): CreateTransform {
    return this as CreateTransform;
  }
  makeUpdateTransform(): null {
    return null;
  }
}

export class UpdateOnlyTemplateStage extends BaseTemplateStage<never, UpdateTransform> {
  makeCreateTransform(): null {
    return null;
  }
  makeUpdateTransform(): UpdateTransform {
    return this as UpdateTransform;
  }
}

export class ExpressionOnlyTemplateStage extends ExpressionTransformer implements TemplateStage {
  transform(tmpl: TemplateAspect): void {
    for (let node = tmpl.update.head; node !== null; node = node.next) {
      node.visitExpressions(this);
    }
    for (let node = tmpl.create.head; node !== null; node = node.next) {
      if (hasTemplateAspect(node)) {
        this.transform(node);
      }
    }
  }
}
