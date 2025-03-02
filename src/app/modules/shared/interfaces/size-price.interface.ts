import { IReadSizeModel } from './size.interface';

export interface IReadSizePriceModel {
  size: IReadSizeModel;
  price: number;
}

export interface ICreateSizePriceModel {
  sizeId: string;
  price: number;
}

export interface IUpdateSizePriceModel {
  id: string;
  sizeId: string;
  price: number;
}
