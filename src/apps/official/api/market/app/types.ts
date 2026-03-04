export interface MarketApp {
  id: number
  name: string
  code: string
  icon?: string
  description?: string
  category_id?: string
  tag_ids?: string[]
  price?: number
  price_type?: 'free' | 'paid' | 'vip'
  version?: string
  download_count?: number
  is_hot?: boolean
  is_new?: boolean
  created_at: string
  updated_at: string
}

export interface MarketAppSearchParams {
  page?: number
  limit?: number
  category?: string
  tag_id?: string
  pay?: string
  keyword?: string
}
