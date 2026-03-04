export interface Tag {
  id: string
  name: string
  color?: string
  description?: string
  question_count?: number
  created_at?: string
  updated_at?: string
}

export interface TagSearchParams {
  page?: number
  limit?: number
  search?: string
}
