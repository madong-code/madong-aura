export interface MenuItemBase {
  id: string;
  pid: number;
  app?: null | string;
  title: string;
  code: string;
  level?: null;
  type: 1 | 2 | 3 | 4 | 5 | 6;
  sort: number;
  path?: string;
  component?: string;
  redirect?: null;
  icon?: string;
  is_show: 0 | 1;
  is_link?: 0 | 1;
  link_url?: null;
  enabled: 0 | 1;
  open_type?: 0;
  is_cache?: 0 | 1;
  is_sync?: 0 | 1;
  is_affix?: 0 | 1;
  variable?: null;
}

export interface TimeFields {
  created_at?: string;
  created_by?: null;
  updated_at?: string;
  updated_by?: null;
  deleted_at?: null;
}

export interface MenuRow extends MenuItemBase, TimeFields {
  methods: string;
  created_date: string;
  updated_date: string;
  children?: MenuRow[];
}
