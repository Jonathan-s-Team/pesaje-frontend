import { IPerson } from './person.interface';

export interface IPaymentInfo {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  identification: string;
  mobilePhone: string;
  email: string;
  person: IPerson;
  personId: string;
  deletedAt?: Date;
}
