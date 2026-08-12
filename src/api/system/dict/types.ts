export interface DictRow {
  id: string;
  group_code: string;
  name: string;
  code: string;
  data_type: string;
  description: string;
  enabled: number;
  sort: number;
  created_by: string;
  updated_by: string;
  updated_at: string;
}

export interface DictItemRow {
  label: string;
  value: number | string;
  id?: number | string;
  dict_id: number | string;
  code: string;
  sort: number;
  enabled: number;
  color: string;
  other_class: string;
  is_default?: number;
  created_by: number | string;
  updated_by: number | string;
  created_at: number | string;
  updated_at: number | string;
  remark: string;
}

export interface DictOptions extends DictItemRow {
  label: string;
  value: number | string;
}
