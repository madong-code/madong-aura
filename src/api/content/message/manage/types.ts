/** 消息管理（消息定义） */
export interface ManageRecord {
  id: string;
  category_id: string;
  category_name?: string;
  key: string;
  name: string;
  description?: string;
  default_on: number;
  nav_type?: string;
  nav_value?: string;
  sort: number;
  is_system: number;
  is_enabled: number;
  created_at: number;
  updated_at: number;
}

/** 查询参数 */
export interface ManageQuery {
  name?: string;
  category_id?: string;
  is_enabled?: number;
  type?: string;
  page?: number;
  limit?: number;
}
