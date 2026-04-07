import BaseService from '@/api/core/base'
import request from '@/utils/http'
import type { MemberLevel } from './types'

const baseUrl = '/member/level'

export const MemberLevelService = {
  ...BaseService<MemberLevel>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  }),

  getLevelMembers(levelId: number, params?: Record<string, any>): Promise<any> {
    return request.get({ url: `${baseUrl}/${levelId}/members`, params })
  },

  getEnabledLevels(): Promise<MemberLevel[]> {
    return request.get({ url: `${baseUrl}/enabled` })
  },

  updateSort(data: Record<string, any>): Promise<any> {
    return request.put({ url: `${baseUrl}/update-sort`, data })
  },

  checkDelete(levelId: number): Promise<any> {
    return request.get({ url: `${baseUrl}/check-delete/${levelId}` })
  }
};