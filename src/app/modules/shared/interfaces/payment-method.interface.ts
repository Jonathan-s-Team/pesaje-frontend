export interface IPurchasePaymentMethodModel {
  name: string;
  id: string;
}

export interface IReadPurchasePaymentMethodModel {
  ok: boolean;
  data: IPurchasePaymentMethodModel[];
}
