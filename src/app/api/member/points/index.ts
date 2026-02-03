import BaseService from '@/app/api/core/base'
import request from '@/utils/http'
import type { MemberPointsLog } from './points-model'

const baseUrl = '/member/points'

export const MemberPointsService = {
  ...BaseService<MemberPointsLog>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: ['remove', 'update'],
  }),

  operate(data: Record<string, any>): Promise<any> {
    return request.post({ url: `${baseUrl}/operate`, data });
  },

  batchOperate(data: Record<string, any>): Promise<any> {
    return request.post({ url: `${baseUrl}/batch-operate`, data })
  },

  getStatistics(params?: Record<string, any>): Promise<any> {
    return request.get({ url: `${baseUrl}/statistics`, params })
  },

  exportLogs(params?: Record<string, any>): Promise<any> {
    return request.get({ url: `${baseUrl}/export`, params, responseType: 'blob' })
  },

  setRules(data: Record<string, any>): Promise<any> {
    return request.post({ url: `${baseUrl}/rules`, data })
  },

  getRules(): Promise<any> {
    return request.get({ url: `${baseUrl}/rules` })
  }
};