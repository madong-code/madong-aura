export interface Comment {
  id: string
  target_id: string
  target_type: 'question' | 'answer'
  content: string
  author_id: string
  author_name?: string
  author_avatar?: string
  like_count?: number
  created_at: string
}

export interface CommentSearchParams {
  page?: number
  limit?: number
  target_type?: 'question' | 'answer'
  target_id?: string
}
