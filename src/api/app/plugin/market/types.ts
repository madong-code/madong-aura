/** 模块市场 - 插件行 */
export interface ModuleRow {
  code: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  icon?: string;
  cover?: string;
  type?: string;
  is_installed: number;
  is_purchased: number;
  category?: string;
  install_status?: string;
}

/** 模块市场 - 列表响应 */
export interface ModuleListResponse {
  items: ModuleRow[];
  total: number;
}
