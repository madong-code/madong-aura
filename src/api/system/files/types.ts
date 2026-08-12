export interface FilesRow {
  id: string;
  url: string;
  size: string;
  size_info: string;
  hash: string;
  filename: string;
  original_filename: string;
  base_path: string;
  path: string;
  ext: string;
  content_type: string;
  platform: string;
  th_url: string;
  th_filename: string;
  th_size: string;
  th_size_info: string;
  th_content_type: string;
  object_id: string;
  object_type: string;
  attr: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
