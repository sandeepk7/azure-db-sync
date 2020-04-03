import {DataSlot} from './id';

export interface Reference {
  slot: DataSlot|null;
  name: string;
  value: string;
}