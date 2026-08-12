import type { SubscribeQuery } from './types';

import { requestClient } from '#/api/request';

const baseUrl = '/content/message/subscribe';

export const SubscribeService = {
  getMine(params?: SubscribeQuery): Promise<any> {
    return requestClient.get(`${baseUrl}`, { params });
  },

  batchSet(settings: any[]): Promise<any> {
    return requestClient.post(`${baseUrl}/batch-set`, { settings });
  },

  init(): Promise<any> {
    return requestClient.post(`${baseUrl}/init`);
  },
};
