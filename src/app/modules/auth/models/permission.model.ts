export class PermissionModel {
  id: string;
  name: string;
  actions: Permission[];
  suboptions: PermissionModel[];
}

export enum Permission {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
  DELETE = 'Delete',
}
