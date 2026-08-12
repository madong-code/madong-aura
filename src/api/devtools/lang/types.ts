export interface LangItem {
  language: string;
  file: string;
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

export interface LangFile {
  name: string;
  path: string;
  entries: number;
}

export interface LangStatistics {
  total_languages: number;
  total_files: number;
  total_entries: number;
}
