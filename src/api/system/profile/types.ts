/**
 * 更新密码请求参数
 */
export interface UpdatePasswordParam {
  /** 当前密码 */
  old_password: string;
  /** 新密码 */
  new_password: string;
  /** 确认新密码 */
  confirm_password: string;
}

/**
 * 更新个人信息请求参数
 */
export interface UpdateUserInfoParam {
  /** 真实姓名 */
  real_name: string;
  /** 昵称 */
  nick_name: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  mobile_phone: string;
  /** 性别：0=未知，1=男，2=女 */
  sex: number;
  /** 个人签名 */
  signed?: string;
  /** 地址 */
  address?: string;
  /** 头像 */
  avatar?: string;
}

/**
 * 更新头像请求参数
 */
export interface UpdateAvatarParam {
  /** 头像URL */
  avatar: string;
}

/**
 * 用户会话信息
 */
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
  updated_at: string | null;
  deleted_at: number | null;
  remark: string | null;
  created_date: string;
  updated_date: string;
}

 