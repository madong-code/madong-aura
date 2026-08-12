export interface Menu {
  id: number;
  name: string;
  type: string;
  path?: string;
  title: string;
  url?: string;
  icon?: string;
  meta: MenuMeta;
  children?: Menu[];
  sort?: number;
  [key: string]: any;
}

export interface MenuMeta {
  id: number;
  type: string;
  menu_type: string;
  target?: string;
  hidden?: boolean;
  disabled?: boolean;
  badge?: number | string;
  [key: string]: any;
}

export interface MenuQuery {
  page?: number;
  limit?: number;
  name?: string;
  type?: string;
  status?: number;
  [key: string]: any;
}
