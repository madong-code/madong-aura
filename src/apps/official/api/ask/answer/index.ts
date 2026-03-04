import BaseService from '@/api/core/base'
import type { Answer } from './types'

const baseUrl = '/ask/answer'

/**
 * 回答服务
 */
export const AnswerService = {
  ...BaseService<Answer>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
