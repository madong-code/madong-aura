import BaseService from '@/api/core/base'
import type { Question, QuestionSearchParams } from './types'

const baseUrl = '/ask/question'

/**
 * 问题服务
 */
export const QuestionService = {
  ...BaseService<Question>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
