import type { ReviewLogRow } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

/**
 * 审核操作日志（域：content/review/log，只读）
 */
const baseUrl = '/content/review/log';

export const reviewLogService = {
  ...BaseService<ReviewLogRow>({ baseUrl }),

  /** 清理指定天数之前的日志 */
  clean: (days: number) => requestClient.post(`${baseUrl}/clean`, { days }),

  /** 批量删除审核操作日志 */
  batchRemove: (params: { ids: (number | string)[] }) =>
    requestClient.delete(baseUrl, { data: { ids: params.ids } }),
};

export default reviewLogService;
