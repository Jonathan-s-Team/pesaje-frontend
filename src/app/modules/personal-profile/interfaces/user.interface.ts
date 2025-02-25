export interface IUpdateUserModel {
  username?: string;
  password?: string;
  roles?: string[];
  person?: {
    names: string;
    lastNames: string;
    identification: string;
    birthDate: string;
    address: string;
    phone: string;
    mobilePhone: string;
    email: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    mobilePhone2?: string;
  };
}

export interface IReadUsersModel{
  deletedAt: string;
  id: string;
  person: string;
  roles: string[];
  username: string;
}
