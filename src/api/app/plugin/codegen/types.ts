/** 生成器列表行 */
export interface GeneratorRow {
  id: string;
  table_name: string;
  table_content: string;
  plugin_name: string;
  module_name: string;
  class_name: string;
  created_date: string;
  updated_date: string;
  [key: string]: any;
}

/** 生成器列表响应 */
export interface GeneratorListResponse {
  items: GeneratorRow[];
  total: number;
}

/** 基础设置 */
export interface BasicConfig {
  table_name: string;
  table_content: string;
  plugin_name: string;
  module_name: string;
  class_name: string;
  camel_case_name?: string;
  pascal_case_name?: string;
}

/** 字段配置 */
export interface FieldConfig {
  column_name: string;
  column_comment: string;
  column_type: string;
  is_pk: number;
  is_required: number;
  is_insert: number;
  is_update: number;
  is_lists: number;
  is_search: number;
  query_type: string;
  view_type: string;
  validate_type: string;
}

/** 生成配置 */
export interface GenerateConfigData {
  is_delete: number;
  delete_column_name: string;
  edit_type: number;
  order_column_name: string;
  order_type: number;
  parent_menu: string;
  addon_name: string;
  table_column: any[];
}

/** 关联配置 */
export interface RelationConfig {
  type: string;
  name: string;
  addon: string;
  model: string;
  local_key: string;
  foreign_key: string;
}

/** 完整的代码生成配置 */
export interface CodeGenerateFormData {
  basic: BasicConfig;
  columns: FieldConfig[];
  config: GenerateConfigData;
  relations: RelationConfig[];
}

/** 数据表信息 */
export interface TableInfo {
  name: string;
  comment: string;
  engine: string;
  collation: string;
  created_date: string;
}
