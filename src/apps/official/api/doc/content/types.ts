export interface DocContent {
  id: string
  project_id?: string
  menu_id?: string
  title: string
  content: string
  path?: string
  created_at: string
  updated_at: string
}

export interface DocContentSearchParams {
  project_id?: string
  menu_id?: string
  search?: string
}
