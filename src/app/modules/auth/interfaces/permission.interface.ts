export interface IPermission {
  id: string;
  name: string;
  parentOption?: string;
  route?: string;
  icon?: string;
  actions: PermissionEnum[];
  suboptions: IPermission[];
}

export enum PermissionEnum {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
  DELETE = 'Delete',
}
