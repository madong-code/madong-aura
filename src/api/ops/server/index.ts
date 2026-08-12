import type { ServerInfo } from './types';

import { requestClient } from '#/api/request';

const baseUrl = '/ops/server';

export const ServerService = {
  list(params?: Record<string, any>): Promise<ServerInfo> {
    return requestClient.get(baseUrl, { params });
  },
};
