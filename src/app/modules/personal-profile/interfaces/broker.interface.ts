import { IPersonModel } from 'src/app/shared/interfaces/person.interface';

export interface ICreateBrokerModel {
  deletedAt: string;
  id: string;
  person: IPersonModel;
  buyerItBelongs: string;
}

export interface IUpdateBrokerModel {
  deletedAt: string;
  id: string;
  person: IPersonModel;
  buyerItBelongs: string;
}

export interface IReadBrokerModel {
  deletedAt: string;
  id: string;
  person: {
    photo: string;
    names: string;
    lastNames: string;
    identification: string;
    birthDate: string;
    address: string;
    phone: string;
    mobilePhone: string;
    mobilePhone2: string;
    email: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    id?: string;
  };
  buyerItBelongs: {
    id: string;
    fullName: string;
  };
}
