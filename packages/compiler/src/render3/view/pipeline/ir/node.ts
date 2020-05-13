
import * as o from '../../../../output/output_ast';
import {LinkedList, LinkedListNode, Transform} from './linked_list';

export type Id = number&{__brand: 'IrId'};

const CREATE_BRAND = Symbol('CreateNode');

export abstract class CreateNode implements LinkedListNode<CreateNode> {
  private[CREATE_BRAND] = true;

  prev: CreateNode|null = null;
  next: CreateNode|null = null;

  visitExpressions(visitor: o.ExpressionVisitor, ctx?: any): void {}

  withPrevAndNext(prev: CreateNode|null, next: CreateNode|null): this {
    this.prev = prev;
    this.next = next;
    return this;
  }
}

export type CreateList<T extends CreateNode = CreateNode> = LinkedList<T>;
export const CreateList: {new<T extends CreateNode = CreateNode>(): CreateList<T>} = LinkedList;
export type CreateTransform<T extends CreateNode = CreateNode> = Transform<T>;

const UPDATE_BRAND = Symbol('UpdateNode');

export abstract class UpdateNode implements LinkedListNode<UpdateNode> {
  private[UPDATE_BRAND] = true;

  prev: UpdateNode|null = null;
  next: UpdateNode|null = null;

  abstract visitExpressions(visitor: o.ExpressionVisitor, ctx?: any): void;

  withPrevAndNext(prev: UpdateNode|null, next: UpdateNode|null): this {
    this.prev = prev;
    this.next = next;
    return this;
  }
}

export type UpdateList = LinkedList<UpdateNode>;
export const UpdateList: {new (): UpdateList} = LinkedList;
export type UpdateTransform = Transform<UpdateNode>;


export interface CreateEmitter {
  emit(node: CreateNode): o.Statement|null;
}

export interface UpdateEmitter {
  emit(node: UpdateNode): o.Statement|null;
}
