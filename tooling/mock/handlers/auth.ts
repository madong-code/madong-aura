import type { Ctx, RouteDef } from './types';

import { readMultipartFormData } from 'h3';

import {
  ADMIN_USERS,
  findAdminByUserName,
  tokenPair,
  verifyToken,
} from '../utils/admin/auth';
import { ROLES, ROLE_MENU_IDS, SESSIONS } from '../utils/admin/datasets';
import {
  buildMenuTree,
  PERM_CODES,
  permCodesForMenuIds,
  vbenMenus,
  vbenMenusForMenuIds,
} from '../utils/admin/menu-data';
import { failWith, paginate } from '../utils/admin/response';
import { nextId, now } from '../utils/admin/store';

/** 脱敏输出 */
function sanitize(user: Record<string, any>) {
  const { password: _pwd, ...rest } = user;
  return rest;
}

function roleListOf(user: Record<string, any>) {
  return (user.role_id_list ?? [])
    .map((id: number) => ROLES.find((r) => r.id === id))
    .filter(Boolean)
    .map((r: any) => ({ id: r.id, name: r.name }));
}

/** 聚合用户全部角色关联的菜单 id（多角色取并集） */
function menuIdsOfUser(user: Record<string, any>): Set<number> {
  const ids = new Set<number>();
  for (const roleId of user.role_id_list ?? []) {
    for (const menuId of ROLE_MENU_IDS.get(Number(roleId)) ?? []) {
      ids.add(menuId);
    }
  }
  return ids;
}

/** user-info：同时携带 vben 基础字段与后端 snake_case 字段 */
function buildUserInfo(user: Record<string, any>) {
  return {
    id: String(user.id),
    userId: String(user.id),
    username: user.user_name,
    realName: user.real_name,
    avatar: user.avatar ?? '',
    homePath: user.dashboard || undefined,
    roles: roleListOf(user),
    ...sanitize(user),
  };
}

const routes: RouteDef[] = [
  // ==================== 登录/登出/刷新 ====================
  {
    method: 'POST',
    pattern: '/auth/login',
    public: true,
    handler: ({ event, body }: Ctx) => {
      const user = findAdminByUserName(body.user_name);
      if (!user || user.password !== body.password) {
        return failWith(event, '用户名或密码错误', -1);
      }
      if (user.enabled !== 1) {
        return failWith(event, '账号已被禁用', -1);
      }
      if (user.is_locked === 1) {
        return failWith(event, '账号已被锁定', -1);
      }
      return tokenPair(user);
    },
  },
  {
    method: 'POST',
    pattern: '/auth/logout',
    public: true,
    handler: () => null,
  },
  {
    method: 'GET',
    pattern: '/system/auth/refresh-token',
    public: true,
    handler: ({ event, query }: Ctx) => {
      const payload = verifyToken(query.refresh_token, 'refresh');
      if (!payload) {
        return failWith(event, '刷新令牌无效或已过期', 401);
      }
      // baseRequestClient 不带 Authorization 头，直接用 payload.id 找用户
      const user = ADMIN_USERS.find(
        (u) => String(u.id) === String(payload.id) && u.enabled === 1,
      );
      if (!user) {
        return failWith(event, '登录失效，请重新登录', 401);
      }
      const t = tokenPair(user);
      return {
        access_token: t.access_token,
        refresh_token: t.refresh_token,
        expires_in: t.expires_in,
        expires_at: Math.floor(Date.now() / 1000) + t.expires_in,
      };
    },
  },

  // ==================== 用户信息/菜单/权限码 ====================
  {
    method: 'GET',
    pattern: '/system/auth/user-info',
    handler: ({ user }: Ctx) => buildUserInfo(user),
  },
  {
    method: 'GET',
    pattern: '/system/auth/user-menus',
    // 对齐真实后端：超管全量；普通用户仅返回其角色关联的菜单（祖先目录链自动补齐）
    handler: ({ user }: Ctx) =>
      user.is_super === 1
        ? vbenMenus()
        : vbenMenusForMenuIds(menuIdsOfUser(user)),
  },
  {
    method: 'GET',
    pattern: '/system/auth/perm-code',
    // 超管返回全部真实权限码（mock 不返回 '*'，v-access 以真实码验收）；
    // 普通用户仅返回角色关联菜单/按钮的 code
    handler: ({ user }: Ctx) =>
      user.is_super === 1
        ? PERM_CODES
        : permCodesForMenuIds(menuIdsOfUser(user)),
  },
  {
    method: 'GET',
    pattern: '/system/auth/user-permissions',
    handler: () => buildMenuTree(),
  },

  // ==================== 角色-菜单授权 ====================
  {
    method: 'GET',
    pattern: '/system/auth/role-menu-ids',
    handler: ({ query }: Ctx) => ROLE_MENU_IDS.get(Number(query.role_id)) ?? [],
  },
  {
    method: 'POST',
    pattern: '/system/auth/save-role-menu',
    handler: ({ body }: Ctx) => {
      ROLE_MENU_IDS.set(Number(body.role_id), (body.menu_id ?? []).map(Number));
      return null;
    },
  },
  {
    method: 'GET',
    pattern: '/system/auth/user-list-by-role-id',
    handler: ({ query }: Ctx) => {
      const roleId = Number(query.role_id);
      const list = MOCK_ADMIN_LIST().filter((u: any) =>
        (u.role_id_list ?? []).includes(roleId),
      );
      return paginate(list, query);
    },
  },
  {
    method: 'POST',
    pattern: '/system/auth/save-user-role',
    handler: ({ body }: Ctx) => {
      const rows = Array.isArray(body) ? body : (body.rows ?? [body]);
      for (const row of rows) {
        const u = findAdminRow(row.admin_id);
        if (u && !u.role_id_list.includes(Number(row.role_id))) {
          u.role_id_list.push(Number(row.role_id));
        }
      }
      return null;
    },
  },
  {
    method: 'POST',
    pattern: '/system/auth/remove-user-role',
    handler: ({ body }: Ctx) => {
      const rows = Array.isArray(body) ? body : (body.rows ?? [body]);
      for (const row of rows) {
        const u = findAdminRow(row.admin_id);
        if (u) {
          u.role_id_list = u.role_id_list.filter(
            (id: number) => id !== Number(row.role_id),
          );
        }
      }
      return null;
    },
  },
  {
    method: 'GET',
    pattern: '/system/auth/user-list-exclude-role-id',
    handler: ({ query }: Ctx) => {
      const roleId = Number(query.role_id);
      const list = MOCK_ADMIN_LIST().filter(
        (u: any) => !(u.role_id_list ?? []).includes(roleId),
      );
      return paginate(list, query);
    },
  },

  // ==================== 个人中心 ====================
  {
    method: 'GET',
    pattern: '/auth/profile',
    handler: ({ user }: Ctx) => sanitize(user),
  },
  {
    method: 'PUT',
    pattern: '/auth/profile/avatar',
    handler: async ({ event, user }: Ctx) => {
      // FormData 或 JSON {avatar}
      let avatar = '';
      try {
        const parts = await readMultipartFormData(event);
        const file = parts?.find(
          (p) => p.name === 'file' || p.name === 'avatar',
        );
        if (file) {
          avatar = `mock://avatar/${user.id}/${Date.now()}.${(file.filename ?? 'png').split('.').pop()}`;
        } else {
          const j = parts?.find((p) => p.name === 'avatar');
          avatar = j ? j.data.toString() : '';
        }
      } catch {
        avatar = '';
      }
      user.avatar = avatar || user.avatar;
      return { avatar: user.avatar };
    },
  },
  {
    method: 'PUT',
    pattern: '/auth/profile/password',
    handler: ({ event, body, user }: Ctx) => {
      if (user.password !== body.old_password) {
        return failWith(event, '原密码错误', -1);
      }
      if (body.new_password !== body.confirm_password) {
        return failWith(event, '两次输入的新密码不一致', -1);
      }
      user.password = body.new_password;
      return null;
    },
  },
  {
    method: 'GET',
    pattern: '/auth/profile/sessions',
    handler: ({ query }: Ctx) => paginate(SESSIONS, query),
  },
  {
    method: 'DELETE',
    pattern: '/auth/profile/sessions/:id',
    handler: ({ params }: Ctx) => {
      const idx = SESSIONS.findIndex((s) => s.id === params[0]);
      if (idx >= 0) SESSIONS.splice(idx, 1);
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/auth/profile/update-preferences',
    handler: ({ body, user }: Ctx) => {
      user.backend_setting = body.preferences ?? body;
      return null;
    },
  },
  // 兼容后端注解路径 /auth/profile/{id}/update-preferences
  {
    method: 'PUT',
    pattern: '/auth/profile/:id/update-preferences',
    handler: ({ body, user }: Ctx) => {
      user.backend_setting = body.preferences ?? body;
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/auth/profile',
    handler: ({ body, user }: Ctx) => {
      const fields = [
        'real_name',
        'nick_name',
        'email',
        'mobile_phone',
        'sex',
        'signed',
        'address',
        'avatar',
        'birthday',
        'tel',
        'remark',
      ];
      for (const f of fields) {
        if (body[f] !== undefined) (user as any)[f] = body[f];
      }
      return sanitize(user);
    },
  },
];

// ==================== 内部工具 ====================
function findAdminRow(id: number | string) {
  return ADMIN_USERS.find((u) => String(u.id) === String(id));
}

/** 管理员列表（含运行时新建的账号），直接使用 ADMIN_USERS 同一引用 */
function MOCK_ADMIN_LIST() {
  return ADMIN_USERS.map((u) => sanitize(u));
}

// 菜单 CRUD 供 system.ts 使用
export function createMenuRowData(data: Record<string, any>) {
  const t = now();
  return {
    id: nextId(),
    pid: Number(data.pid ?? 0),
    app: data.app ?? 'admin',
    title: data.title ?? '',
    code: data.code ?? null,
    level: data.level ?? null,
    type: Number(data.type ?? 1),
    sort: Number(data.sort ?? 0),
    path: data.path ?? '',
    component: data.component ?? null,
    redirect: data.redirect ?? null,
    icon: data.icon ?? null,
    is_show: Number(data.is_show ?? 1),
    is_link: Number(data.is_link ?? 0),
    link_url: data.link_url ?? null,
    enabled: Number(data.enabled ?? 1),
    open_type: data.open_type ?? 0,
    is_cache: Number(data.is_cache ?? 0),
    is_tab: Number(data.is_tab ?? 1),
    is_sync: Number(data.is_sync ?? 1),
    is_affix: Number(data.is_affix ?? 0),
    methods: data.methods ?? 'GET',
    is_frame: Number(data.is_frame ?? 0),
    variable: data.variable ?? null,
    source: data.source ?? null,
    show_text_badge: data.show_text_badge ?? null,
    created_at: t,
    updated_at: t,
  };
}

export default routes;
