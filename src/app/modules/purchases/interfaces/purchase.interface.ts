import { IReadBrokerModel } from '../../personal-profile/interfaces/broker.interface';
import { IReadUserModel } from '../../settings/interfaces/user.interface';
import { IReadClientModel } from '../../shared/interfaces/client.interface';
import { IReadCompanyModel } from '../../shared/interfaces/company.interface';
import { IReadPeriodModel } from '../../shared/interfaces/period.interface';
import { IReadShrimpFarmModel } from '../../shared/interfaces/shrimp-farm.interface';

export interface ICreatePurchaseModel {
  buyer: string;
  company: string;
  period: string;
  broker: string;
  client: string;
  // status: PurchaseStatusEnum;
  shrimpFarm: string;
  averageGrams: number;
  price: number;
  pounds: number;
  averageGrams2?: number;
  price2?: number;
  pounds2?: number;
  totalPounds: number;
  subtotal: number;
  subtotal2?: number;
  grandTotal: number;
  totalAgreedToPay: number;
  hasInvoice: boolean;
  invoice?: string;
  purchaseDate: string;
}

export interface IReadPurchaseModel {
  buyer: IReadUserModel | string;
  company: IReadCompanyModel | string;
  period: IReadPeriodModel | string;
  broker: IReadBrokerModel | string;
  client: IReadClientModel | string;
  shrimpFarm: IReadShrimpFarmModel | string;
  averageGrams: number;
  price: number;
  pounds: number;
  averageGrams2?: number;
  price2?: number;
  pounds2?: number;
  totalPounds: number;
  subtotal: number;
  subtotal2?: number;
  grandTotal: number;
  totalAgreedToPay: number;
  hasInvoice: boolean;
  invoice?: string;
  status: PurchaseStatusEnum;
  deletedAt: string | null;
  id: string;
}

export interface IUpdatePurchaseModel {
  averageGrams: number;
  price: number;
  pounds: number;
  averageGrams2?: number;
  price2?: number;
  pounds2?: number;
  totalPounds: number;
  subtotal: number;
  subtotal2?: number;
  grandTotal: number;
  totalAgreedToPay: number;
  hasInvoice: boolean;
  invoice?: string;
}

export enum PurchaseStatusEnum {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_CONFIRMATION = 'READY_FOR_CONFIRMATION',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}
