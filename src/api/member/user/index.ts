import BaseService from '@/api/core/base'
import request from '@/utils/http'
import type { Member } from './types'

const baseUrl = '/member/user'

export const MemberService = {
  ...BaseService<Member>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  }),

  resetPassword(id: number, data: Record<string, any>): Promise<any> {
    return request.put({ url: `${baseUrl}/${id}/reset-password`, data })
  },

  enable(data: Record<string, any>): Promise<any> {
    return request.put({ url: `${baseUrl}/enable`, data })
  },

  disable(data: Record<string, any>): Promise<any> {
    return request.put({ url: `${baseUrl}/disable`, data })
  },

  assignTags(id: number | string, data: Record<string, any>): Promise<any> {
    return request.put({ url: `${baseUrl}/${id}/assign-tags`, data })
  },

  getDetail(id: number): Promise<Member> {
    return request.get({ url: `${baseUrl}/${id}` })
  },

  batchOperation(data: Record<string, any>): Promise<any> {
    return request.post({ url: `${baseUrl}/batch`, data })
  },

  statistics(params?: Record<string, any>): Promise<any> {
    return request.get({ url: `${baseUrl}/statistics`, params })
  },

  adjustPoints(id: number, data: Record<string, any>): Promise<any> {
    return request.put({ url: `${baseUrl}/${id}/adjust-points`, data })
  }
};