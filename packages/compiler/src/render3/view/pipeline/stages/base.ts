import * as cir from '../ir/create';
import * as uir from '../ir/update';
import {ExpressionTransformer} from '../util/expression_transformer';

export interface InputTemplate {
  create: cir.List;
  update: uir.List;
}

export interface TemplateStage { transform(tmpl: InputTemplate): void; }

export abstract class BaseTemplateStage<CT extends cir.Transform, UT extends uir.Transform>
    implements TemplateStage {
  protected abstract makeCreateTransform(prev: CT|null, tmplId: cir.Id|null): CT|null;
  protected abstract makeUpdateTransform(prev: UT|null, tmplId: cir.Id|null): UT|null;

  private transformImpl(
      tmpl: InputTemplate, id: cir.Id|null, prevCreate: CT|null, prevUpdate: UT|null): void {
    const currCreate = this.makeCreateTransform(prevCreate, id);
    const currUpdate = this.makeUpdateTransform(prevUpdate, id);

    if (currCreate !== null) {
      tmpl.create.applyTransform(currCreate);
    }
    if (currUpdate !== null) {
      tmpl.update.applyTransform(currUpdate);
    }

    for (let node = tmpl.create.head; node !== null; node = node.next) {
      if (node.kind === cir.Kind.Template) {
        this.transformImpl(node, node.id, currCreate, currUpdate);
      }
    }
  }

  transform(tmpl: InputTemplate): void { this.transformImpl(tmpl, null, null, null); }
}

export class CreateOnlyTemplateStage extends BaseTemplateStage<cir.Transform, never> {
  makeCreateTransform(): cir.Transform { return this as cir.Transform; }
  makeUpdateTransform(): null { return null; }
}

export class UpdateOnlyTemplateStage extends BaseTemplateStage<never, uir.Transform> {
  makeCreateTransform(): null { return null; }
  makeUpdateTransform(): uir.Transform { return this as uir.Transform; }
}

export class ExpressionOnlyTemplateStage extends ExpressionTransformer implements TemplateStage {
  transform(tmpl: InputTemplate): void {
    for (let node = tmpl.update.head; node !== null; node = node.next) {
      uir.visitAllExpressions(node, this);
    }
    for (let node = tmpl.create.head; node !== null; node = node.next) {
      if (node.kind === cir.Kind.Template) {
        this.transform(node);
      }
    }
  }
}