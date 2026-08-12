/** 消息模板 */
export interface TemplateRecord {
  id: string;
  type: string;
  template_id?: string;
  title?: string;
  content_template?: string;
  button_template?: string;
  url?: string;
  uni_url?: string;
  webhook_url?: string;
  image?: string;
  status: number;
  push_rule: number;
  minute: number;
  definition_name?: string;
  created_at: number;
  updated_at: number;
}

/** 查询参数 */
export interface TemplateQuery {
  type?: string;
  page?: number;
  limit?: number;
}
