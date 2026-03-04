export interface DocMenu {
  id: string
  project_name: string
  parent_id?: string
  title: string
  path?: string
  sort?: number
  content_id?: string
  created_at?: string
  updated_at?: string
}

export interface DocMenuSearchParams {
  project_name?: string
  parent_id?: string
}
