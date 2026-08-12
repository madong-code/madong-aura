import type { AuthInfo } from './types';

import { requestClient } from '#/api/request';

const baseUrl = '/plugin/auth-info';

export const AppPluginDelegationService = {
  /** 获取授权信息 */
  getAuthInfo(): Promise<AuthInfo> {
    return requestClient.get(baseUrl);
  },

  /** 设置授权信息 */
  setAuthInfo(data: { auth_code: string; auth_secret: string }): Promise<any> {
    return requestClient.post(baseUrl, data);
  },
};
