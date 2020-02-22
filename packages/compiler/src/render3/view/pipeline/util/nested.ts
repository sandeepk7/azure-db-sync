import {IrTemplate} from '../input/template';
import * as cir from '../ir/create';
import * as uir from '../ir/update';

export class NestedUpdateTransform implements cir.Transform {
  constructor(private transformOrFactory: uir.Transform|(() => uir.Transform)) {}

  visit(node: cir.Node): cir.Node {
    if (node.kind === cir.Kind.Template) {
      node.update.applyTransform(
          this.transformOrFactory instanceof Function ? this.transformOrFactory() :
                                                        this.transformOrFactory);
      node.create.applyTransform(this);
    }
    return node;
  }

  foo(x: string|null) {}

  static apply(template: IrTemplate, transformOrFactory: uir.Transform|(() => uir.Transform)) {
    template.update.applyTransform(
        transformOrFactory instanceof Function ? transformOrFactory() : transformOrFactory);
    template.create.applyTransform(new NestedUpdateTransform(transformOrFactory));
  }
}
