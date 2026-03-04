import BaseService from '@/api/core/base'
import type { Comment, CommentSearchParams } from './types'

const baseUrl = '/ask/comment'

/**
 * 评论服务
 */
export const CommentService = {
  ...BaseService<Comment>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
