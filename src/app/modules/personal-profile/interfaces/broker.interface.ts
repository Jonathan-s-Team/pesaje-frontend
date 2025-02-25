import { IPersonModel } from '../../shared/interfaces/person.interface';

export interface ICreateBrokerModel {
  deletedAt: string;
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
  person: IPersonModel;
  buyerItBelongs: {
    id: string;
    fullName: string;
  };
}
