export interface Answer {
  id: string
  question_id: string
  content: string
  author_id: string
  author_name?: string
  author_avatar?: string
  like_count?: number
  dislike_count?: number
  is_best?: boolean
  created_at: string
  updated_at: string
}

export interface AnswerSearchParams {
  page?: number
  limit?: number
  question_id?: string
}
