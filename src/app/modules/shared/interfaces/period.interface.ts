import {
  ICreateSizePriceModel,
  IReadSizePriceModel,
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
