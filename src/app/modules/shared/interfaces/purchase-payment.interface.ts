export interface IPurchasePaymentModel {
  purchase: string;
  paymentMethod: string;
  amount: number;
  paymentDate: Date;
  deletedAt?: Date;
  id: string;
}

export interface ICreateUpdatePurchasePaymentModel {
  purchase: string;
  paymentMethod: string;
  amount: number;
  paymentDate: Date;
}

export interface IReadPurchasePaymentModel {
  ok: boolean;
  data: IPurchasePaymentModel[];
}
