import * as cir from './create';
import * as uir from './update';

export interface IrTemplate {
  create: cir.List;
  update: cir.List;
}