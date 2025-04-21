import { IReducedDetailedPurchaseModel } from '../../purchases/interfaces/purchase.interface';
import { IReducedUserModel } from '../../settings/interfaces/user.interface';
import { IReadCompanyModel } from '../../shared/interfaces/company.interface';
import { ICompanySaleItemModel } from './company-sale-item.interface';

export interface ISaleModel {
  id?: string;
  purchase: string;
  controlNumber: string;
  total: number;
  saleDate: string;
  buyer: IReducedUserModel;
  client: IReducedUserModel;
  company: IReadCompanyModel;
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
  np?: string;
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
  grandTotal: number;
  percentageTotal: number;
  items: ICompanySaleItemModel[];
}

export interface ICompanySaleModel {
  id: string;
  purchase: IReducedDetailedPurchaseModel;
  sale: string;
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
  grandTotal: number;
  percentageTotal: number;
  items: ICompanySaleItemModel[];
}

export enum SaleTypeEnum {
  COMPANY = 'COMPANY',
  LOCAL = 'LOCAL',
}
