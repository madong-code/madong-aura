import type { RecycleBinRow } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/system/recycle';

export const RecycleBinService = {
  ...BaseService<RecycleBinRow>({ baseUrl }),

  restore(data: Record<string, any>) {
    return requestClient.put(baseUrl, data);
  },

  /** 批量恢复 */
  batchRestore(ids: (number | string)[]) {
    return requestClient.put(`${baseUrl}/restore`, { ids });
  },

  /** 批量删除（永久删除回收站记录） */
  batchDelete(ids: (number | string)[]) {
    return requestClient.delete(baseUrl, { data: { ids } });
  },
};
