import { IRoleModel } from '../../auth/interfaces/role.interface';
import { IPersonModel } from '../../shared/interfaces/person.interface';

export interface IUpdateUserModel {
  id: string;
  username?: string;
  password?: string;
  roles: string[];
  person: IPersonModel;
}

export interface ICreateUserModel {
  username?: string;
  password?: string;
  roles?: string[];
  person?: IPersonModel;
}

export interface IReadUsersModel {
  deletedAt?: Date;
  id: string;
  person: IPersonModel;
  roles: IRoleModel[];
  username: string;
}
