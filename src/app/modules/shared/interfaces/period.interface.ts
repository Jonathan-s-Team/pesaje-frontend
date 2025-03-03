import {
  ICreateSizePriceModel,
  IReadSizePriceModel,
  IUpdateSizePriceModel,
} from './size-price.interface';

export interface ICreatePeriodModel {
  name: string;
  company: string;
  sizePrices: ICreateSizePriceModel[];
}

export interface IReadPeriodModel {
  id: string;
  name: string;
  company?: string;
  sizePrices?: IReadSizePriceModel[];
}

export interface IUpdatePeriodModel {
  sizePrices: IUpdateSizePriceModel[];
}
