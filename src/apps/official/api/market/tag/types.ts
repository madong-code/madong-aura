export interface MarketTag {
  id: string
  name: string
  color?: string
  description?: string
  app_count?: number
  created_at?: string
  updated_at?: string
}

export interface MarketTagSearchParams {
  page?: number
  limit?: number
  search?: string
}
