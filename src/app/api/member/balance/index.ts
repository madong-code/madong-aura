import BaseService from '@/app/api/core/base'
import request from '@/utils/http'
import type { MemberBalanceLog } from './balance-model'

const baseUrl = '/member/balance'

export const MemberBalanceService = {
  ...BaseService<MemberBalanceLog>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: ['remove', 'update']
  }),

  operate(data: Record<string, any>): Promise<any> {
    return request.post({ url: `${baseUrl}/operate`, data })
  },

  batchOperate(data: Record<string, any>): Promise<any> {
    return request.post({ url: `${baseUrl}/batch-operate`, data })
  },

  getStatistics(params?: Record<string, any>): Promise<any> {
    return request.get({ url: `${baseUrl}/statistics`, params })
  },

  exportLogs(params?: Record<string, any>): Promise<any> {
    return request.get({ url: `${baseUrl}/export`, params, responseType: 'blob' })
  }
};