import BaseService from '@/api/core/base'
import request from '@/utils/http'
import type { MemberTag } from './types'

const baseUrl = '/member/tag'

export const MemberTagService = {
  ...BaseService<MemberTag>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  }),

  getTagMembers(tagId: number, params?: Record<string, any>): Promise<any> {
    return request.get({ url: `${baseUrl}/${tagId}/members`, params })
  },

  batchAssignTags(data: Record<string, any>): Promise<any> {
    return request.post({ url: `${baseUrl}/batch-assign`, data })
  },

  getEnabledTags(): Promise<MemberTag[]> {
    return request.get({ url: `${baseUrl}/enabled` })
  },

  updateSort(data: Record<string, any>): Promise<any> {
    return request.put({ url: `${baseUrl}/update-sort`, data })
  }
};