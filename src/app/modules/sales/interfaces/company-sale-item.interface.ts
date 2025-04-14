export interface ICreateUpdateCompanySaleItemModel {
  id?: string;
  style: CompanySaleStyleEnum;
  class: string;
  size: string;
  pounds: number;
  price: number;
  total: number;
  percentage: number;
}

export enum CompanySaleStyleEnum {
  WHOLE = 'WHOLE',
  TAIL = 'TAIL',
}
