export interface DocProject {
  id: string
  name: string
  title?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface DocProjectSearchParams {
  page?: number
  limit?: number
  search?: string
}
