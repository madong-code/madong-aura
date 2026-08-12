import { requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    user_name?: string;
    password?: string;
    mobile_phone?: string;
    code?: string;
    uuid?: string;
    type?: string;
    grant_type?: string;
    key_id?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    client_id: string;
    expires_time: number;
  }

  export interface RefreshTokenResult {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
  }
}

export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}

export async function logoutApi() {
  return requestClient.post('/auth/logout');
}
