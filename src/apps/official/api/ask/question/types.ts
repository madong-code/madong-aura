export interface Question {
  id: string
  title: string
  content: string
  category_id?: string
  tags?: string[]
  author_id: string
  author_name?: string
  author_avatar?: string
  view_count?: number
  answer_count?: number
  is_solved?: boolean
  best_answer_id?: string
  status?: 'published' | 'draft' | 'closed'
  type?: string
  created_at: string
  updated_at: string
}

export interface QuestionSearchParams {
  page?: number
  limit?: number
  tag?: string
  tags?: string
  search?: string
  type?: string
  category_id?: string
  status?: string
}
