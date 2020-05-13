import {Id, UpdateNode} from '../node';

export interface OrderableAspect {
  readonly id: Id;
  readonly priority: number;
}

export function hasOrderableAspect(node: UpdateNode): node is UpdateNode&OrderableAspect {
  return typeof (node as any).priority === 'number';
}
