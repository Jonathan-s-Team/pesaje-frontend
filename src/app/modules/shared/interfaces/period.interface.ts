import {
  ICreateSizePriceModel,
  IReadSizePriceModel,
  IUpdateSizePriceModel,
} from './size-price.interface';

export interface ICreatePeriodModel {
  name: string;
  receivedDateTime: string;
  company: string;
  sizePrices: ICreateSizePriceModel[];
}

export interface IReadPeriodModel {
  id: string;
  name: string;
  receivedDateTime: string;
  company: string;
  sizePrices?: IReadSizePriceModel[];
}

export interface IUpdatePeriodModel {
  receivedDateTime?: string;
  sizePrices: IUpdateSizePriceModel[];
}
