/** 未读数响应 */
export interface UnreadCountData {
  total: number;
  categories: {
    category_id: string;
    count: number;
    key?: string;
    name?: string;
  }[];
}

/** 消息项 */
export interface MessageItem {
  id: string;
  definition_id?: string;
  category_id?: string;
  category_name?: string;
  definition_name?: string;
  module_name?: string; // 兼容旧字段
  title: string;
  content?: string;
  date: string;
  isRead?: boolean;
  link?: string;
  query?: Record<string, any>;
  actionText?: string;
  extra_data?: Record<string, any>;
  priority?: number;
  sender_id?: string;
  receiver_id?: string;
  read_at?: null | string;
  created_at?: string;
}

/** 消息列表响应 */
export interface MessageListResponse {
  list: MessageItem[];
  total: number;
}
