export interface IReadSizeModel {
  id: string;
  size: string;
  type: SizeTypeEnum;
}

export enum SizeTypeEnum {
  WHOLE = 'WHOLE',
  HEADLESS = 'HEADLESS',
}
