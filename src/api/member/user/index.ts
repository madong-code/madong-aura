import type { Member } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/member/user';

export const MemberService = {
  ...BaseService<Member>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  }),

  resetPassword(id: number, data: Record<string, any>): Promise<any> {
    return requestClient.put(`${baseUrl}/${id}/reset-password`, data);
  },

  enable(data: Record<string, any>): Promise<any> {
    return requestClient.put(`${baseUrl}/enable`, data);
  },

  disable(data: Record<string, any>): Promise<any> {
    return requestClient.put(`${baseUrl}/disable`, data);
  },

  assignTags(id: number | string, data: Record<string, any>): Promise<any> {
    return requestClient.put(`${baseUrl}/${id}/assign-tags`, data);
  },

  getDetail(id: number): Promise<Member> {
    return requestClient.get(`${baseUrl}/${id}`);
  },

  batchOperation(data: Record<string, any>): Promise<any> {
    return requestClient.post(`${baseUrl}/batch`, data);
  },

  statistics(params?: Record<string, any>): Promise<any> {
    return requestClient.get(`${baseUrl}/statistics`, { params });
  },

  adjustPoints(id: number, data: Record<string, any>): Promise<any> {
    return requestClient.put(`${baseUrl}/${id}/adjust-points`, data);
  },
};
