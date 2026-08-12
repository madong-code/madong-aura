export interface UpdatePasswordParam {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateUserInfoParam {
  real_name: string;
  nick_name: string;
  email: string;
  mobile_phone: string;
  sex: number;
  signed?: string;
  address?: string;
  avatar?: string;
}

export interface UpdateAvatarParam {
  avatar: string;
}

export interface UserSession {
  id: string;
  user_name: string;
  ip: string;
  ip_location: string;
  os: string;
  browser: string;
  status: number;
  message: string;
  login_time: number;
  key: string;
  created_at: string;
  expires_at: string;
  updated_at: null | string;
  deleted_at: null | number;
  remark: null | string;
  created_date: string;
  updated_date: string;
}
