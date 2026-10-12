/**
 * 站点菜单（/web/menu）实体，与后端 app\model\web\Menu 对应
 * 注意：id / pid 为雪花ID，接口以字符串返回，避免 JS 精度丢失
 */
export interface Menu {
  id: string;
  pid: string;
  app: string;
  /** 菜单分类：1 导航菜单 2 会员菜单 3 头部动作菜单（字典 web.MenuCategory） */
  category: number;
  source: string;
  code?: null | string;
  is_public?: number;
  is_no_auth?: number;
  name: string;
  url?: null | string;
  icon?: null | string;
  level?: number;
  /** 菜单类型：字典 web.MenuType */
  type: number;
  sort?: number;
  /** 打开方式：字典 web.MenuTarget */
  target?: number;
  extra?: Record<string, any> | null;
  /** 是否显示：字典 common.YesNoStatus */
  is_show?: number;
  /** 状态：字典 common.EnabledStatus */
  enabled?: number;
  created_at?: null | number;
  updated_at?: null | number;
  deleted_at?: null | number;
  /** 以下为后端追加的字典文本 */
  category_text?: string;
  type_text?: string;
  target_text?: string;
  is_show_text?: string;
  enabled_text?: string;
  children?: Menu[];
  [key: string]: any;
}

export interface MenuQuery {
  page?: number;
  limit?: number;
  app?: string;
  category?: number;
  name?: string;
  type?: number;
  format?: 'normal' | 'select' | 'table_tree' | 'tree';
  [key: string]: any;
}