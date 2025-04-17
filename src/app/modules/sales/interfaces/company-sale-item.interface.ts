export interface ICompanySaleItemModel {
  id?: string;
  style: CompanySaleStyleEnum;
  class: string;
  size: string;
  pounds: number;
  price: number;
  referencePrice?: number;
  total: number;
  percentage: number;
}

export enum CompanySaleStyleEnum {
  WHOLE = 'WHOLE',
  TAIL = 'TAIL',
}
