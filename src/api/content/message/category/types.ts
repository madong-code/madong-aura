/** 消息分类 */
export interface MessageCategory {
  id: string;
  pid: string;
  key: string;
  name: string;
  icon?: string;
  description?: string;
  sort?: number;
  level?: number;
  is_show?: boolean;
  is_system?: boolean;
  is_enabled?: boolean;
  created_at?: null | string;
  updated_at?: null | string;
}
