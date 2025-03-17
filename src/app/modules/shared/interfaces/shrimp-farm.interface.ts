export interface ICreateShrimpFarmModel {
  identifier: string;
  numberHectares: number;
  place: string;
  transportationMethod: TransportationMethodEnum;
  distanceToGate: number;
  timeFromPedernales: number;
  client: string;
  buyerItBelongs: string;
}

export interface IUpdateShrimpFarmModel {
  identifier: string;
  numberHectares: number;
  place: string;
  transportationMethod: TransportationMethodEnum;
  distanceToGate: number;
  timeFromPedernales: number;
  buyerItBelongs: string;
}

export interface IReadShrimpFarmModel {
  identifier: string;
  numberHectares: number;
  place: string;
  transportationMethod: TransportationMethodEnum;
  distanceToGate: number;
  timeFromPedernales: number;
  client: string;
  buyerItBelongs: string;
  deletedAt: string | null;
  id: string;
}

export enum TransportationMethodEnum {
  CAR = 'CAR',
  CARBOAT = 'CARBOAT',
}
