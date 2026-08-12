export interface LoginRecordRow {
  id: string;
  user_name: string;
  ip: string;
  ip_location: string;
  os: string;
  browser: string;
  status: number;
  message: null | string;
  login_time: number;
  created_at: string;
  remark: null | string;
}

export interface OperateRecordRow {
  id: string;
  name: string;
  app: string;
  ip: string;
  ip_location: string;
  browser: string;
  os: string;
  url: string;
  class_name: string;
  action: string;
  method: string;
  param: string;
  result: string;
  user_name: string;
  created_date: string;
}
