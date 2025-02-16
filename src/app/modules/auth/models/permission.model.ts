export interface PermissionModel {
  id: string;
  name: string;
  parentOption?: string;
  route?: string;
  icon?: string;
  actions: Permission[];
  suboptions: PermissionModel[];
}

export enum Permission {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
  DELETE = 'Delete',
}
