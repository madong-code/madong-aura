import type { UserInfo } from '#/core/shared/types/user';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/system/auth/user-info');
}
