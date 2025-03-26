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

// Nueva interfaz para la respuesta del servidor
export interface ILogisticResponse {
  ok: boolean;
  data: IReadLogisticModel;
}

export interface IReadLogisticModel {
  purchase: string;
  items: string[]; // Ahora son IDs de los items en lugar de objetos completos
  logisticsDate: string;
  grandTotal: number;
  deletedAt: string | null;
  id: string;
}
