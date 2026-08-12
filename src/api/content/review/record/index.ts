import type {
  ReviewDetail,
  ReviewListRes,
  ReviewRow,
  ReviewTypeItem,
} from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

/**
 * 审核记录（域：content/review/record，只读）
 */
const baseUrl = '/content/review/record';

export const reviewRecordService = {
  ...BaseService<ReviewRow>({ baseUrl }),

  /** 审核记录详情 */
  detail(id: number) {
    return requestClient.get<ReviewDetail>(`${baseUrl}/${id}`);
  },

  /** 归档列表 */
  archiveList(params: Record<string, any>) {
    return requestClient.get<ReviewListRes>(`${baseUrl}/archive`, { params });
  },

  /** 归档详情 */
  archiveDetail(id: number) {
    return requestClient.get<ReviewDetail>(`${baseUrl}/archive/${id}`);
  },

  /** 审核类型列表（用于筛选下拉） */
  types() {
    return requestClient.get<ReviewTypeItem[]>(`${baseUrl}/types`);
  },
};

export default reviewRecordService;
