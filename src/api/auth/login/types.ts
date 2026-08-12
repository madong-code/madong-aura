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
