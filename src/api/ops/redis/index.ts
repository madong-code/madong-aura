import type { RedisMonitorData } from './types';

import { requestClient } from '#/api/request';

const baseUrl = '/ops/redis';

export const RedisService = {
  list(params?: Record<string, any>): Promise<RedisMonitorData> {
    return requestClient.get(baseUrl, { params });
  },
};
