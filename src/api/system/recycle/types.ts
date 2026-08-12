export interface RecycleBinRow {
  id?: number | string;
  data: string;
  table_name: string;
  table_prefix: string;
  enabled: number;
  ip: string;
}
