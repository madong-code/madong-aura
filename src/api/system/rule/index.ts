import type { RouteRow } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/system/rule';

export const RuleService = {
  ...BaseService<RouteRow>({ baseUrl }),

  list(params?: Record<string, any>): Promise<RouteRow[]> {
    return requestClient.get('system/rule', { params });
  },

  cate(params?: Record<string, any>): Promise<any[]> {
    return requestClient.get('system/rule-cate', { params });
  },

  sync(data?: any): Promise<void> {
    return requestClient.post('system/rule/refresh', data);
  },
};

export type { HttpMethod, RouteRow } from './types';
