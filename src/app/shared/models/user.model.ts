export interface UserModel {
  person: string;
  username: string;
  password: string;
  roles: { _id: string; name: string }[];
  brokers?: string[];
  deletedAt?: Date | null;
  company?: string;
  phone?: string;
  companySite?: string;
  country?: string;
  communication?: string;
  allowChanges?: boolean;
}
