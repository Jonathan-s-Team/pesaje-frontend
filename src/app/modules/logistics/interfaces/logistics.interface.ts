import {
  ICreateUpdateLogisticsItemModel,
  ILogisticsItemModel,
} from './logistics-item.interface';

export interface ICreateUpdateLogisticsModel {
  id?: string;
  purchase?: string;
  type?: LogisticsTypeEnum;
  logisticsDate: string;
  grandTotal: number;
  items: ICreateUpdateLogisticsItemModel[];
}

export interface IReadLogisticsModel {
  purchase: string;
  controlNumber: string;
  items: ILogisticsItemModel[];
  type: LogisticsTypeEnum;
  logisticsDate: string;
  grandTotal: number;
  description: string;
  deletedAt: string | null;
  id: string;
}

export enum LogisticsTypeEnum {
  SHIPMENT = 'SHIPMENT',
  LOCAL_PROCESSING = 'LOCAL_PROCESSING',
}
