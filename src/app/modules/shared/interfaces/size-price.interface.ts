import { IReadSizeModel } from './size.interface';

export interface IReadSizePriceModel {
  size: IReadSizeModel;
  price: Number;
}

export interface ICreateSizePriceModel {
  period: string;
  size: IReadSizeModel;
  price: Number;
}

export interface IUpdateSizePriceModel {
  id: string;
  period: string;
  size: IReadSizeModel;
  price: Number;
}
