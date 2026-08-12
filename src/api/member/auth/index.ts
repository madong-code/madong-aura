import { requestClient } from '#/api/request';

const BASE_URL = '/member/auth';

export const MemberAuthService = {
  /** 获取会员认证信息 */
  getAuthInfo() {
    return requestClient.get(BASE_URL);
  },

  // ========== 标签-菜单授权 ==========

  /** 获取所有可用的前端菜单树（web_menu） */
  getMemberAllPermission(): Promise<any[]> {
    return requestClient.get(`${BASE_URL}/permissions`, { params: {} });
  },

  /** 获取标签已授权的菜单ID列表 */
  tagMenuIds(params: { tag_id: number | string }): Promise<number[]> {
    return requestClient.get(`${BASE_URL}/tag-menu-ids`, { params });
  },

  /** 保存标签菜单授权 */
  saveTagMenu(data: {
    menu_id: (number | string)[];
    tag_id: number | string;
  }): Promise<void> {
    return requestClient.post(`${BASE_URL}/save-tag-menu`, data);
  },

  // ========== 标签-会员管理 ==========

  /** 获取标签下的会员列表 */
  userListByTagId(params: Record<string, any>): Promise<any> {
    return requestClient.get(`${BASE_URL}/user-list-by-tag-id`, { params });
  },

  /** 获取未包含在该标签下的会员列表 */
  userListExcludeTagId(params: Record<string, any>): Promise<any> {
    return requestClient.get(`${BASE_URL}/user-list-exclude-tag-id`, {
      params,
    });
  },

  /** 移除会员-标签关联 */
  removeUserTag(data: { member_id: number; tag_id: number }[]): Promise<void> {
    return requestClient.post(`${BASE_URL}/remove-user-tag`, data);
  },

  /** 保存会员-标签关联 */
  saveUserTag(data: { member_id: number; tag_id: number }[]): Promise<void> {
    return requestClient.post(`${BASE_URL}/save-user-tag`, data);
  },
};
