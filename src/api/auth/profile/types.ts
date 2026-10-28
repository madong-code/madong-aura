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
  /** 会话唯一标识（强制下线使用） */
  jti: string;
  /** 客户端类型 */
  client_type?: string;
  user_name: string;
  real_name?: string;
  avatar?: string;
  ip: string;
  ip_location: string;
  os: string;
  browser: string;
  /** 1 在线 */
  status: number;
  /** 登录时间（秒级时间戳） */
  login_time: number;
}

export interface UserSessionList {
  items: UserSession[];
  total: number;
}
