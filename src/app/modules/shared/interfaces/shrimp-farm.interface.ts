export interface ICreateUpdateShrimpFarmModel {
  identifier: string;
  numberHectares: number;
  place: string;
  transportationMethod: string;
  distanceToGate: number;
  timeFromPedernales: number;
  client?: string;
}

export interface IReadShrimpFarmModel {
  identifier: string;
  numberHectares: number;
  place: string;
  transportationMethod: string;
  distanceToGate: number;
  timeFromPedernales: number;
  client: string;
  deletedAt: string | null;
  id: string;
}
