import type { MemberLevel } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/member/level';

export const MemberLevelService = {
  ...BaseService<MemberLevel>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  }),

  getLevelMembers(levelId: number, params?: Record<string, any>): Promise<any> {
    return requestClient.get(`${baseUrl}/${levelId}/members`, { params });
  },

  getEnabledLevels(): Promise<MemberLevel[]> {
    return requestClient.get(`${baseUrl}/enabled`);
  },

  updateSort(data: Record<string, any>): Promise<any> {
    return requestClient.put(`${baseUrl}/update-sort`, data);
  },

  checkDelete(levelId: number): Promise<any> {
    return requestClient.get(`${baseUrl}/check-delete/${levelId}`);
  },
};
