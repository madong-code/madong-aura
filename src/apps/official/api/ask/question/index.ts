import BaseService from '@/api/core/base'
import type { Question, QuestionSearchParams } from './types'
import request from '@/utils/http'

const baseUrl = '/ask/question'

/**
 * 问题服务
 */
export const QuestionService = {
  ...BaseService<Question>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  }),

  /**
   * 设置置顶
   */
  async setSticky(id: number | string, data: { is_sticky: number; sticky_order?: number }) {
    return request.post(`${baseUrl}/${id}/sticky`, data)
  },

  /**
   * 设置精华
   */
  async setExcellent(id: number | string, data: { is_excellent: number }) {
    return request.post(`${baseUrl}/${id}/excellent`, data)
  }
}

const answerBaseUrl = '/ask/answer'

/**
 * 回答服务
 */
export const AnswerService = {
  ...BaseService({
    baseUrl: answerBaseUrl,
    forbiddenMethods: ['create', 'update', 'export', 'changStatus']
  }),

  /**
   * 设置最佳答案
   */
  async setBest(data: { id: number | string; is_best: number }) {
    return request.post(`${answerBaseUrl}/best`, data)
  }
}
