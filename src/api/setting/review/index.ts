import BaseService from '@/api/core/base';
import request from '@/utils/http'
import type { ReviewListRequest, ReviewRow, ReviewCreateRequest, ReviewUpdateRequest } from './types'


const baseUrl = '/review';

export const ReviewService = {
  ...BaseService<ReviewRow>({ baseUrl }),

  /**
 * 审核通过
 */
  approve(id: number, reason: string = '') {
    return request.put<any>({
      url: `/review/${id}/approve`,
      data: { reason }
    })
  },

  /**
   * 审核拒绝
   */
  reject(id: number, reason: string = '') {
    return request.put<any>({
      url: `/review/${id}/reject`,
      data: { reason }
    })
  },


  batchApprove(ids: number[], reason: string = '') {
    return request.post<any>({
      url: `/review/batch/approve`,
      data: { ids, reason }
    })
  },

  batchReject(ids: number[], reason: string = '') {
    return request.post<any>({
      url: `/review/batch/reject`,
      data: { ids, reason }
    })
  },

  /**
   * 反审核
   */
  unapprove(id: number) {
    return request.put<any>({
      url: `/setting/review/${id}/unapprove`,
      method: 'post'
    })
  },

};

