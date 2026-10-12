import type { H3Event } from 'h3';

import jwt from 'jsonwebtoken';

import { randomToken, now, nextId } from './store';

const ACCESS_SECRET = 'access_token_secret';
const REFRESH_SECRET = 'refresh_token_secret';

export const ACCESS_TTL = 7200; // 与后端 JwtToken 一致
export const REFRESH_TTL = 604800;

export interface AdminRow {
  id: number;
  user_name: string;
  real_name: string;
  nick_name: string;
  password: string;
  email: string;
  avatar: string;
  mobile_phone: string | null;
  is_super: number;
  sex: number;
  dept_id: number | null;
  enabled: number;
  is_locked: number;
  signed: string | null;
  dashboard: string | null;
  birthday: string | null;
  tel: string | null;
  remark: string | null;
  address: string | null;
  backend_setting: Record<string, any> | null;
  role_id_list: number[];
  post_id_list: number[];
  login_ip: string;
  login_time: string | null;
  created_at: string;
  updated_at: string;
  created_by: null;
  updated_by: null;
  deleted_at: null;
  created_date: string;
  updated_date: string;
  [key: string]: any;
}

/** 与 AdminSeeder 对齐：默认超级管理员 admin/123456 */
export const ADMIN_USERS: AdminRow[] = [
  {
    id: 1,
    user_name: 'admin',
    real_name: '超级管理员',
    nick_name: '超级管理员',
    password: '123456',
    email: 'admin@example.com',
    avatar: '',
    mobile_phone: null,
    is_super: 1,
    sex: 0,
    dept_id: 1,
    enabled: 1,
    is_locked: 0,
    signed: null,
    dashboard: null,
    birthday: null,
    tel: null,
    remark: null,
    address: null,
    backend_setting: null,
    role_id_list: [1],
    post_id_list: [],
    login_ip: '127.0.0.1',
    login_time: now(),
    created_at: '2026-01-01 00:00:00',
    updated_at: now(),
    created_by: null,
    updated_by: null,
    deleted_at: null,
    created_date: '2026-01-01',
    updated_date: now().slice(0, 10),
  },
];

export function findAdminByUserName(username: string): AdminRow | undefined {
  return ADMIN_USERS.find((u) => u.user_name === username);
}

/** payload 结构对齐后端 JwtToken：{iss,id,client,jti,type,iat,exp,extra} */
export function signToken(user: AdminRow, type: 'access' | 'refresh'): string {
  const ttl = type === 'access' ? ACCESS_TTL : REFRESH_TTL;
  const secret = type === 'access' ? ACCESS_SECRET : REFRESH_SECRET;
  const payload = {
    iss: 'webman',
    id: String(user.id),
    client: 'admin',
    jti: randomToken(32),
    type,
    extra: {
      id: String(user.id),
      user_name: user.user_name,
      real_name: user.real_name,
      nick_name: user.nick_name,
      is_super: user.is_super,
      mobile_phone: user.mobile_phone,
      email: user.email,
      avatar: user.avatar,
      signed: user.signed,
      dashboard: user.dashboard,
      dept_id: user.dept_id,
      enabled: user.enabled,
      login_ip: '127.0.0.1',
      login_time: Math.floor(Date.now() / 1000),
      sex: user.sex,
      birthday: user.birthday,
      tel: user.tel,
      is_locked: user.is_locked,
      admin_types: ['admin'],
    },
  };
  return jwt.sign(payload as any, secret, { expiresIn: ttl });
}

export function tokenPair(user: AdminRow) {
  const expires_in = ACCESS_TTL;
  return {
    access_token: signToken(user, 'access'),
    refresh_token: signToken(user, 'refresh'),
    expires_in,
    client_id: 'mock-client',
    expires_time: Math.floor(Date.now() / 1000) + expires_in,
  };
}

export function verifyToken(
  token: string | undefined,
  type: 'access' | 'refresh',
): { id: string; [key: string]: any } | null {
  if (!token) return null;
  try {
    const secret = type === 'access' ? ACCESS_SECRET : REFRESH_SECRET;
    const payload = jwt.verify(token, secret) as any;
    if (payload?.type !== type) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getBearerToken(event: H3Event): string | undefined {
  const header =
    event.node.req.headers['authorization'] ??
    (event.node.req.headers as Record<string, string | string[] | undefined>)[
      'token'
    ];
  const raw = Array.isArray(header) ? header[0] : header;
  if (raw) {
    return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
  }
  // SSE（EventSource 不支持自定义 header）通过 ?token=Bearer%20xxx 传递
  const queryToken = event.node.req.url?.match(/[?&]token=([^&]+)/)?.[1];
  if (queryToken) {
    const decoded = decodeURIComponent(queryToken);
    return decoded.startsWith('Bearer ') ? decoded.slice(7) : decoded;
  }
  return undefined;
}

/** 返回当前登录管理员；无效返回 null（由 dispatcher 统一转 401） */
export function currentUser(event: H3Event): AdminRow | null {
  const payload = verifyToken(getBearerToken(event), 'access');
  if (!payload) return null;
  const user = ADMIN_USERS.find((u) => String(u.id) === String(payload.id));
  return user && user.enabled === 1 ? user : null;
}

/** 为新创建的管理员入库（mock 明文密码，可直接登录） */
export function createAdminRow(data: Record<string, any>): AdminRow {
  const t = now();
  return {
    id: nextId(),
    user_name: data.user_name,
    real_name: data.real_name ?? data.user_name,
    nick_name: data.nick_name ?? data.real_name ?? data.user_name,
    password: data.password ?? '123456',
    email: data.email ?? '',
    avatar: data.avatar ?? '',
    mobile_phone: data.mobile_phone ?? null,
    is_super: 0,
    sex: data.sex ?? 0,
    dept_id: data.dept_id ?? null,
    enabled: data.enabled ?? 1,
    is_locked: 0,
    signed: null,
    dashboard: null,
    birthday: data.birthday ?? null,
    tel: data.tel ?? null,
    remark: data.remark ?? null,
    address: data.address ?? null,
    backend_setting: null,
    role_id_list: data.role_id_list ?? [],
    post_id_list: data.post_id_list ?? [],
    login_ip: '',
    login_time: null,
    created_at: t,
    updated_at: t,
    created_by: null,
    updated_by: null,
    deleted_at: null,
    created_date: t.slice(0, 10),
    updated_date: t.slice(0, 10),
  };
}
