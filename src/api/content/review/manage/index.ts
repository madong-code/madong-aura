import type {
  ReviewDetail,
  ReviewListRes,
  ReviewRow,
  ReviewTypeItem,
} from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

/**
 * 审核管理（域：content/review/manage）
 *
 * 审核记录由业务模块触发创建，管理端仅做「查看 / 审批 / 批量审批」操作，
 * 因此未提供新增 / 编辑 / 删除接口（后端 ReviewController 亦未开放）。
 */
const baseUrl = '/content/review/manage';

export const reviewManageService = {
  ...BaseService<ReviewRow>({ baseUrl }),

  /** 审核详情（聚合：审核信息 / 表单快照 / 状态 / 事件） */
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

  /** 通过（单条） */
  approve(id: number, reason = '', force = false) {
    return requestClient.post(`${baseUrl}/${id}/approve`, { reason, force });
  },

  /** 拒绝（单条） */
  reject(id: number, reason = '', force = false) {
    return requestClient.post(`${baseUrl}/${id}/reject`, { reason, force });
  },

  /** 取消（单条） */
  cancel(id: number, reason = '') {
    return requestClient.post(`${baseUrl}/${id}/cancel`, { reason });
  },

  /** 批量通过 */
  batchApprove(ids: number[], force = false) {
    return requestClient.post(`${baseUrl}/batch-approve`, { ids, force });
  },

  /** 批量拒绝 */
  batchReject(ids: number[], reason = '', force = false) {
    return requestClient.post(`${baseUrl}/batch-reject`, {
      ids,
      reason,
      force,
    });
  },

  /** 审核类型列表（用于筛选下拉） */
  types() {
    return requestClient.get<ReviewTypeItem[]>(`${baseUrl}/types`);
  },

  /** 审核统计 */
  statistics() {
    return requestClient.get(`${baseUrl}/statistics`);
  },

  /** 流程进度 */
  flowProgress(id: number) {
    return requestClient.get(`${baseUrl}/${id}/flow-progress`);
  },
};

export default reviewManageService;
