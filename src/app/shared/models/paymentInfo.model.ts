export interface PaymentInfoModel {
  bankName: string;
  accountName: string;
  accountNumber: string;
  identification: string;
  mobilePhone: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}
