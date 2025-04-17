import { IReducedDetailedPurchaseModel } from '../../purchases/interfaces/purchase.interface';
import { IReducedUserModel } from '../../settings/interfaces/user.interface';
import { ILogisticsCategoryModel } from '../../shared/interfaces/logistic-type.interface';
import {
  ICreateUpdateLogisticsItemModel,
  ILogisticsItemModel,
} from './logistics-item.interface';

export interface ICreateUpdateLogisticsModel {
  id?: string;
  purchase?: string;
  type: LogisticsTypeEnum;
  logisticsDate: string;
  grandTotal: number;
  items: ICreateUpdateLogisticsItemModel[];
}

export interface IDetailedReadLogisticsModel {
  purchase: IReducedDetailedPurchaseModel;
  controlNumber: string;
  items: ILogisticsItemModel[];
  type: LogisticsTypeEnum;
  logisticsDate: string;
  grandTotal: number;
  description: string;
  deletedAt: string | null;
  id: string;
}

export interface IReadLogisticsModel {
  purchase: string;
  controlNumber: string;
  items: string[];
  type: LogisticsTypeEnum;
  logisticsDate: string;
  grandTotal: number;
  description: string;
  buyer: IReducedUserModel;
  client: IReducedUserModel;
  deletedAt: string | null;
  id: string;
}

export enum LogisticsTypeEnum {
  SHIPMENT = 'SHIPMENT',
  LOCAL_PROCESSING = 'LOCAL_PROCESSING',
}
