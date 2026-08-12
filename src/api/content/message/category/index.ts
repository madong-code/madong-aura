import type { MessageCategory } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/content/message/category';

export const CategoryService = {
  ...BaseService<MessageCategory>({ baseUrl }),

  getAll(): Promise<MessageCategory[]> {
    return requestClient.get(`${baseUrl}/all`);
  },

  getDefinitions(key: string): Promise<any> {
    return requestClient.get(`${baseUrl}/${key}/definitions`);
  },

  /** 兼容旧路由 */
  getModules(key: string): Promise<any> {
    return requestClient.get(`${baseUrl}/${key}/modules`);
  },
};
