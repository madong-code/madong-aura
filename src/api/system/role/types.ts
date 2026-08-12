export enum DataScopeEnum {
  ALL = 1,
  CUSTOM = 2,
  DEPT = 3,
  DEPT_WITH_CHILD = 4,
  SELF = 5,
}

export interface RoleRow {
  [key: string]: any;
  id: string;
  pid?: string;
  name: string;
  code: string;
  is_super_admin: 0 | 1;
  role_type: number;
  data_scope: DataScopeEnum;
  enabled: 0 | 1;
  sort: number;
  permissions?: string[];
  remark?: null | string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at?: null | string;
  created_date: string;
  updated_date: string;
}
