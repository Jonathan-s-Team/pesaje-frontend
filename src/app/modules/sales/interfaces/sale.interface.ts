import { IReducedDetailedPurchaseModel } from '../../purchases/interfaces/purchase.interface';
import { ICreateUpdateCompanySaleItemModel } from './company-sale-item.interface';

export interface ISaleModel {
  id?: string;
  purchase: string;
  saleDate: string;
  type: SaleTypeEnum;
  deletedAt?: string;
}

export interface ICreateUpdateCompanySaleModel {
  id?: string;
  purchase: string;
  saleDate: string;
  document: string;
  batch: string;
  provider: string;
  np: string;
  serialNumber: number;
  receptionDateTime: string;
  settleDateTime: string;
  batchAverageGram: number;
  wholeReceivedPounds: number;
  trashPounds: number;
  netReceivedPounds: number;
  processedPounds: number;
  performance: number;
  poundsGrandTotal: number;
  priceGrandTotal: number;
  percentageTotal: number;
  items: ICreateUpdateCompanySaleItemModel[];
}

export interface ICompanySaleModel {
  id: string;
  sale: string;
  document: string;
  batch: string;
  provider: string;
  np: string;
  serialNumber: number;
  receptionDateTime: string;
  settleDateTime: string;
  batchAverageGram: number;
  wholeReceivedPounds: number;
  trashPounds: number;
  netReceivedPounds: number;
  processedPounds: number;
  performance: number;
  poundsGrandTotal: number;
  priceGrandTotal: number;
  percentageTotal: number;
  items: string[];
}

export enum SaleTypeEnum {
  COMPANY = 'COMPANY',
  LOCAL = 'LOCAL',
}
