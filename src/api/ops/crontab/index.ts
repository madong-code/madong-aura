import type { CrontabLogRow, CrontabRow } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/ops/crontab';

export const CrontabService = {
  ...BaseService<CrontabRow>({ baseUrl }),

  start(id: number | string, params?: Record<string, any>) {
    return requestClient.put(`${baseUrl}/${id}/resume`, params);
  },

  resume(id: number | string, params?: Record<string, any>) {
    return requestClient.put(`${baseUrl}/${id}/resume`, params);
  },

  pause(id: number | string, params?: Record<string, any>) {
    return requestClient.put(`${baseUrl}/${id}/pause`, params);
  },

  execute(id: number | string, params?: Record<string, any>) {
    return requestClient.put(`${baseUrl}/${id}/execute`, params);
  },
};

export const CrontabLogService = {
  ...BaseService<CrontabLogRow>({ baseUrl: '/ops/crontab-log' }),
};
