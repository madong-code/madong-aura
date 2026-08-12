import type { MemberPointsLog } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/member/points';

export const MemberPointsService = {
  ...BaseService<MemberPointsLog>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: ['remove', 'update'],
  }),

  operate(data: Record<string, any>): Promise<any> {
    return requestClient.post(`${baseUrl}/operate`, data);
  },

  batchOperate(data: Record<string, any>): Promise<any> {
    return requestClient.post(`${baseUrl}/batch-operate`, data);
  },

  getStatistics(params?: Record<string, any>): Promise<any> {
    return requestClient.get(`${baseUrl}/statistics`, { params });
  },

  exportLogs(params?: Record<string, any>): Promise<any> {
    return requestClient.get(`${baseUrl}/export`, {
      params,
      responseType: 'blob',
    } as any);
  },

  setRules(data: Record<string, any>): Promise<any> {
    return requestClient.post(`${baseUrl}/rules`, data);
  },

  getRules(): Promise<any> {
    return requestClient.get(`${baseUrl}/rules`);
  },
};
