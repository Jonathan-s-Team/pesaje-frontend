import { IReadSizeModel } from './size.interface';

export interface IReadSizePriceModel {
  size: IReadSizeModel;
  price: Number;
}

export interface ICreateSizePriceModel {
  sizeId: string;
  price: Number;
}

export interface IUpdateSizePriceModel {
  id: string;
  sizeId: string;
  price: Number;
}
