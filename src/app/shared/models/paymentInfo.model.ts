import { PersonModel } from './person.model';

export interface PaymentInfoModel {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  identification: string;
  mobilePhone: string;
  email: string;
  person: PersonModel;
  personId: string;
  deletedAt?: Date;
}
