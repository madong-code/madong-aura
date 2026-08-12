/**
 *+------------------
 * madong
 *+------------------
 * Copyright (c) https://gitee.com/motion-code  All rights reserved.
 *+------------------
 * Author: Mr. April (405784684@qq.com)
 *+------------------
 * Official Website: https://madong.tech
 */

export interface GenerateColumnRow {
  id: number | string;
  /** 租户ID(雪花ID) */
  tenant_id: number;
  /** 是否必填: 1=是 0=否 */
  is_required: number;
  /** 是否查询字段: 1=是 0=否 */
  is_query: number;
  /** 模型 */
  model: string;
  /** 是否删除: 1=是 0=否 */
  is_delete: number;
  /** 修改时间 */
  updated_at: number;
  /** 表ID */
  table_id: number;
  /** 是否主键: 1=是 0=否 */
  is_pk: number;
  /** 查询方式 */
  query_type: string;
  /** 标签键 */
  label_key: string;
  /** 验证类型 */
  validate_type: string;
  /** 删除时间 */
  deleted_at: number;
  /** 列名 */
  column_name: string;
  /** 是否更新字段: 1=是 0=否 */
  is_update: number;
  /** 视图类型 */
  view_type: string;
  /** 值键 */
  value_key: string;
  /** 状态: 1=启用 0=停用 */
  enabled: number;
  /** 备注 */
  remark: string;
  /** 列注释 */
  column_comment: string;
  /** 是否列表字段: 1=是 0=否 */
  is_lists: number;
  /** 字典类型 */
  dict_type: string;
  /** 更新时间 */
  update_time: number;
  /** 创建时间 */
  created_at: number;
  /** 是否搜索字段: 1=是 0=否 */
  is_search: number;
  /** 排序 */
  sort: number;
  /** 是否排序: 1=是 0=否 */
  is_order: number;
  /** 更新者 */
  updated_by: number;
  /** 是否插入字段: 1=是 0=否 */
  is_insert: number;
  /** 创建时间 */
  create_time: number;
  /** 列类型 */
  column_type: string;
  /** 插件 */
  plugin: string;
  /** 创建者 */
  created_by: number;
}
