export interface PersonModel {
  person: string;
  names: string;
  lastNames: string;
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
