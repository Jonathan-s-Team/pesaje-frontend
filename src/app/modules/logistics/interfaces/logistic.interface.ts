export interface ILogisticModel {
  logisticsType: string;
  unit: number;
  cost: number;
  total: number;
}

export interface ICreateLogisticModel {
  purchase: string;
  logisticsDate: string;
  grandTotal: number;
  items: ILogisticModel[];
}
