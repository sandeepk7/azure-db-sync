import * as o from '../../../../output/output_ast';
import {CreateList, UpdateList} from './node';
import {Scope} from './template_scope';


export class RootTemplate {
  create: CreateList;
  update: UpdateList;
  scope: Scope;

  constructor(create: CreateList, update: UpdateList, scope: Scope) {
    this.create = create;
    this.update = update;
    this.scope = scope;
  }

  name: string|null = null;
  consts: o.Expression[]|null = null;

  decls: number|null = null;
  vars: number|null = null;

  transform(...stages: TemplateStage[]): void {
    for (const stage of stages) {
      stage.transform(this);
    }
  }
}

export class Host {
  create = new CreateList();
  update = new UpdateList();
  attrs: o.Expression[]|null = null;

  decls: number|null = null;
  vars: number|null = null;

  constructor(public name: string) {}

  transform(...stages: HostStage[]): void {
    for (const stage of stages) {
      stage.transform(this);
    }
  }

  isEmpty(): boolean {
    return this.update.head === null && this.create.head === null;
  }
}

export interface TemplateStage {
  transform(tmpl: RootTemplate): void;
}

export interface HostStage {
  transform(host: Host): void;
}
