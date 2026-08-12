/** 插件开发 - 插件行 */
export interface PluginRow {
  id: string;
  key: string;
  title: string;
  desc?: string;
  author?: string;
  version: string;
  type?: string;
  status: number;
  icon?: string;
  cover?: string;
  support_app?: string;
  created_at?: number;
  updated_at?: number;
}

/** 插件开发 - 列表响应 */
export interface PluginListResponse {
  list: PluginRow[];
  total: number;
}
