import { baseRequestClient, requestClient } from '#/api/request';

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  client_id: string;
  expires_time: number;
}

/**
 * 刷新accessToken（GET + query，幂等读操作）
 */
export async function refreshTokenApi(refreshToken: string) {
  return baseRequestClient.get('/system/auth/refresh-token', {
    params: { refresh_token: refreshToken },
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/system/auth/perm-code');
}
