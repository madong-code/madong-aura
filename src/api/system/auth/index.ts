import { requestClient } from '#/api/request';

const baseUrl = '/system/auth';

export const AuthService = {
  /** 获取用户权限（菜单树） */
  getUserPermission(): Promise<any> {
    return requestClient.get(`${baseUrl}/user-permissions`);
  },

  /** 获取角色已授权菜单 ID */
  getRoleMenuIds(params: { role_id: number | string }): Promise<number[]> {
    return requestClient.get(`${baseUrl}/role-menu-ids`, { params });
  },

  /** 保存角色菜单授权 */
  saveRoleMenu(data: {
    menu_id: (number | string)[];
    role_id: number | string;
  }): Promise<void> {
    return requestClient.post(`${baseUrl}/save-role-menu`, data);
  },

  /** 获取角色下的用户列表 */
  getUserListByRoleId(params: Record<string, any>): Promise<any> {
    return requestClient.get(`${baseUrl}/user-list-by-role-id`, { params });
  },

  /** 保存用户角色关联 */
  saveUserRole(
    data: { admin_id: number; role_id: number | string }[],
  ): Promise<void> {
    return requestClient.post(`${baseUrl}/save-user-role`, data);
  },

  /** 移除用户角色 */
  removeUserRole(
    data: { admin_id: number; role_id: number | string }[],
  ): Promise<void> {
    return requestClient.post(`${baseUrl}/remove-user-role`, data);
  },

  /** 获取可添加的用户列表（排除已选角色） */
  getUserListExcludeRoleId(params: Record<string, any>): Promise<any> {
    return requestClient.get(`${baseUrl}/user-list-exclude-role-id`, {
      params,
    });
  },
};
