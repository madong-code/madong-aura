import type { MemberTag } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/member/tag';

export const MemberTagService = {
  ...BaseService<MemberTag>({
    baseUrl,
    allowedMethods: [],
    forbiddenMethods: [],
  }),

  // ========== 成员管理 ==========

  /** 获取标签下的会员列表 */
  getTagMembers(tagId: number, params?: Record<string, any>): Promise<any> {
    return requestClient.get(`${baseUrl}/${tagId}/members`, { params });
  },

  /** 获取未包含在该标签下的会员列表 */
  getExcludedMembers(
    tagId: number,
    params?: Record<string, any>,
  ): Promise<any> {
    return requestClient.get(`${baseUrl}/${tagId}/excluded-members`, {
      params,
    });
  },

  /** 批量分配/移除标签成员 */
  batchAssignTags(data: Record<string, any>): Promise<any> {
    return requestClient.post(`${baseUrl}/batch-assign`, data);
  },

  // ========== 菜单授权 ==========

  /** 获取标签已授权的菜单ID列表 */
  getTagMenuIds(tagId: number | string): Promise<number[]> {
    return requestClient.get(`${baseUrl}/${tagId}/menu-ids`);
  },

  /** 为标签分配菜单权限 */
  saveTagMenu(
    tagId: number | string,
    menuIds: (number | string)[],
  ): Promise<any> {
    return requestClient.put(`/member/${tagId}/permissions`, {
      menu_ids: menuIds,
    });
  },

  // ========== 其他 ==========

  getEnabledTags(): Promise<MemberTag[]> {
    return requestClient.get(`${baseUrl}/enabled`);
  },

  updateSort(data: Record<string, any>): Promise<any> {
    return requestClient.put(`${baseUrl}/update-sort`, data);
  },
};
