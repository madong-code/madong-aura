import { baseRequestClient, requestClient } from '#/api/request';

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  client_id: string;
  expires_time: number;
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi(refreshToken: string) {
  return baseRequestClient.post('/system/auth/refresh-token', {
    refresh_token: refreshToken,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/system/auth/perm-code');
}
