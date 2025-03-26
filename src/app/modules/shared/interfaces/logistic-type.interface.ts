export interface ILogisticTypeModel {
  name: string;
  type: string;
  deleteAt: Date;
  id: string;
}

export interface IReadLogisticTypeModel {
  ok: boolean;
  data: ILogisticTypeModel[];
}
