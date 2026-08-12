import type { MenuRow } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/system/menu';

export const MenuService = {
  ...BaseService<MenuRow>({ baseUrl }),

  batchStore(data: Record<string, any>) {
    return requestClient.post(`${baseUrl}/batch-store`, data);
  },
};
