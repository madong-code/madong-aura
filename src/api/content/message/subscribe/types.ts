/** 订阅查询参数 */
export interface SubscribeQuery {
  page?: number;
  limit?: number;
  keyword?: string;
}

/** 订阅记录行（API 返回的 item 结构） */
export interface SubscribeRow {
  definition_id: number;
  module_key: string;
  module_name: string;
  description: string;
  content_template: string;
  category_id: number;
  category_key: string;
  category_name: string;
  is_subscribed: boolean;
}
