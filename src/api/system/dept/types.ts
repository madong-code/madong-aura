export interface DeptRow {
  id: string;
  pid: number | string;
  level: string;
  code: string;
  name: string;
  main_leader_id: string;
  phone: string;
  enabled: string;
  sort: string;
  children?: DeptRow[];
  remark: string;
}

export interface DeptTree {
  [key: string]: any;
  id: number | string;
  key?: string;
  pid: number | string;
  name: string;
  sort: number;
  children?: DeptTree[];
}

export interface DeptOptionsTree {
  id?: number | string;
  label: string;
  value: number | string;
  children?: DeptOptionsTree[];
}
