import type { Ctx, RouteDef } from './types';

import {
  BLACKLISTS,
  CRONTABS,
  LOGIN_LOGS,
  MEMBER_LEVELS,
  MEMBER_POINTS,
  MEMBER_SIGNS,
  MEMBER_TAGS,
  MEMBER_USERS,
  OPERATE_LOGS,
  RATE_LIMITERS,
  REDIS_INFO,
  SERVER_INFO,
  SYS_ADMIN_TYPES,
  WEB_LINKS,
  WEB_MENUS,
} from '../utils/admin/datasets';
import { crud, daysAgo, nextId, now, toIds } from '../utils/admin/store';
import { crudRoutes } from './system';
import { route } from './types';

// ==================== 本地运行时状态 ====================

/** 标签-前端菜单授权（tag_id -> web menu ids） */
const TAG_MENU_IDS = new Map<number, number[]>([
  [1, [1, 2]],
  [2, []],
  [3, [1]],
]);

/** 定时任务日志 */
const CRONTAB_LOGS: Record<string, any>[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: i + 1,
    crontab_id: (i % 3) + 1,
    crontab_title: ['数据库备份', '缓存清理', '日报生成'][i % 3],
    status: i === 5 ? 0 : 1,
    output: i === 5 ? '执行失败：连接超时' : '执行成功',
    exec_time: daysAgo(i, 3),
    exec_duration: `${(i % 9) + 1}.${i}s`,
    created_at: daysAgo(i, 3),
    updated_at: daysAgo(i, 3),
  }),
);

/** 积分规则 */
const POINT_RULES: Record<string, any> = {
  signin: 5,
  register: 100,
  consumption: 1,
};

// ==================== 会员用户 ====================

const memberUserRoutes: RouteDef[] = [
  {
    method: 'PUT',
    pattern: '/member/user/enable',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids ?? body.id)) {
        const u = crud.find(MEMBER_USERS, id);
        if (u) u.status = 1;
      }
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/member/user/disable',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids ?? body.id)) {
        const u = crud.find(MEMBER_USERS, id);
        if (u) u.status = 0;
      }
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/member/user/:id/reset-password',
    handler: ({ body, params }: Ctx) => {
      const u = crud.find(MEMBER_USERS, params[0]);
      if (u) (u as any).password = body.password ?? '123456';
      return u ?? null;
    },
  },
  {
    method: 'PUT',
    pattern: '/member/user/:id/assign-tags',
    handler: ({ body, params }: Ctx) => {
      const u = crud.find(MEMBER_USERS, params[0]);
      if (u)
        (u as any).tag_ids = (body.tag_ids ?? body.tag_id ?? []).map(Number);
      return u ?? null;
    },
  },
  {
    method: 'PUT',
    pattern: '/member/user/:id/adjust-points',
    handler: ({ body, params }: Ctx) => {
      const u = crud.find(MEMBER_USERS, params[0]);
      if (!u) return null;
      const delta = Number(body.points ?? 0);
      (u as any).points += delta;
      MEMBER_POINTS.unshift({
        id: nextId(),
        member_id: u.id,
        username: (u as any).username,
        nickname: (u as any).nickname,
        type: delta >= 0 ? 1 : 2,
        points: Math.abs(delta),
        points_before: (u as any).points - delta,
        points_after: (u as any).points,
        source: 'admin_adjust',
        remark: body.remark ?? '',
        operator: 'admin',
        create_time: now(),
      });
      return u;
    },
  },
  {
    method: 'GET',
    pattern: '/member/user/statistics',
    handler: () => ({
      total: MEMBER_USERS.length,
      enabled: MEMBER_USERS.filter((u) => u.status === 1).length,
      disabled: MEMBER_USERS.filter((u) => u.status === 0).length,
      today_new: 2,
      week_new: 5,
      month_new: 9,
    }),
  },
  {
    method: 'POST',
    pattern: '/member/user/batch',
    handler: ({ body }: Ctx) => {
      const ids = toIds(body.ids);
      const action = String(body.action ?? body.type ?? '');
      for (const id of ids) {
        const u = crud.find(MEMBER_USERS, id);
        if (!u) continue;
        if (action === 'enable' || action === '1') u.status = 1;
        if (action === 'disable' || action === '0') u.status = 0;
        if (action === 'delete') crud.remove(MEMBER_USERS, [id]);
      }
      return null;
    },
  },
  ...crudRoutes('/member/user', MEMBER_USERS, {
    searchFields: ['username', 'nickname', 'phone', 'email'],
    filterFields: ['status', 'level_id'],
  }),
];

// ==================== 会员认证/标签授权 ====================

function memberBrief(u: Record<string, any>) {
  return {
    id: u.id,
    username: u.username,
    nickname: u.nickname,
    phone: u.phone,
    avatar: u.avatar,
  };
}

const memberAuthRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/member/auth/permissions',
    handler: () => WEB_MENUS,
  },
  {
    method: 'GET',
    pattern: '/member/auth/tag-menu-ids',
    handler: ({ query }: Ctx) => TAG_MENU_IDS.get(Number(query.tag_id)) ?? [],
  },
  {
    method: 'POST',
    pattern: '/member/auth/save-tag-menu',
    handler: ({ body }: Ctx) => {
      TAG_MENU_IDS.set(Number(body.tag_id), (body.menu_id ?? []).map(Number));
      return null;
    },
  },
  {
    method: 'GET',
    pattern: '/member/auth/user-list-by-tag-id',
    handler: ({ query }: Ctx) => {
      const tagId = Number(query.tag_id);
      const list = MEMBER_USERS.filter((u) =>
        (u.tag_ids ?? []).includes(tagId),
      );
      return { items: list.map(memberBrief), total: list.length };
    },
  },
  {
    method: 'GET',
    pattern: '/member/auth/user-list-exclude-tag-id',
    handler: ({ query }: Ctx) => {
      const tagId = Number(query.tag_id);
      const list = MEMBER_USERS.filter(
        (u) => !(u.tag_ids ?? []).includes(tagId),
      );
      return { items: list.map(memberBrief), total: list.length };
    },
  },
  {
    method: 'POST',
    pattern: '/member/auth/save-user-tag',
    handler: ({ body }: Ctx) => {
      for (const row of body ?? []) {
        const u = crud.find(MEMBER_USERS, row.member_id);
        if (u && !(u.tag_ids ?? []).includes(Number(row.tag_id))) {
          u.tag_ids = [...(u.tag_ids ?? []), Number(row.tag_id)];
        }
      }
      return null;
    },
  },
  {
    method: 'POST',
    pattern: '/member/auth/remove-user-tag',
    handler: ({ body }: Ctx) => {
      for (const row of body ?? []) {
        const u = crud.find(MEMBER_USERS, row.member_id);
        if (u) {
          u.tag_ids = (u.tag_ids ?? []).filter((t) => t !== Number(row.tag_id));
        }
      }
      return null;
    },
  },
];

// ==================== 会员等级 ====================

const memberLevelRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/member/level/enabled',
    handler: () => MEMBER_LEVELS.filter((l) => l.status === 1),
  },
  {
    method: 'PUT',
    pattern: '/member/level/update-sort',
    handler: ({ body }: Ctx) => {
      for (const row of body.rows ?? body ?? []) {
        const l = crud.find(MEMBER_LEVELS, row.id);
        if (l) l.sort = Number(row.sort ?? l.sort);
      }
      return null;
    },
  },
  {
    method: 'GET',
    pattern: '/member/level/check-delete/:id',
    handler: ({ params }: Ctx) => ({
      can: !MEMBER_USERS.some((u) => u.level_id === Number(params[0])),
      count: MEMBER_USERS.filter((u) => u.level_id === Number(params[0]))
        .length,
    }),
  },
  {
    method: 'GET',
    pattern: '/member/level/:levelId/members',
    handler: ({ params, query }: Ctx) => {
      const list = MEMBER_USERS.filter((u) => u.level_id === Number(params[0]));
      return { items: list.map(memberBrief), total: list.length };
    },
  },
  ...crudRoutes('/member/level', MEMBER_LEVELS, {
    searchFields: ['name'],
    filterFields: ['status'],
    newRow: (data) => ({
      id: nextId(),
      name: data.name ?? '',
      icon: data.icon ?? '',
      min_points: Number(data.min_points ?? 0),
      discount: Number(data.discount ?? 100),
      description: data.description ?? '',
      member_count: 0,
      sort: Number(data.sort ?? 0),
      status: Number(data.status ?? 1),
      create_time: now(),
    }),
  }),
];

// ==================== 积分 ====================

const memberPointsRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/member/points/statistics',
    handler: () => ({
      total_income: MEMBER_POINTS.filter((p) => p.type === 1).reduce(
        (s, p) => s + p.points,
        0,
      ),
      total_expense: MEMBER_POINTS.filter((p) => p.type === 2).reduce(
        (s, p) => s + p.points,
        0,
      ),
      log_count: MEMBER_POINTS.length,
    }),
  },
  {
    method: 'POST',
    pattern: '/member/points/operate',
    handler: ({ body }: Ctx) => {
      const u = crud.find(MEMBER_USERS, body.member_id);
      if (!u) return null;
      const delta = Number(body.points ?? 0);
      (u as any).points += delta;
      MEMBER_POINTS.unshift({
        id: nextId(),
        member_id: u.id,
        username: (u as any).username,
        nickname: (u as any).nickname,
        type: delta >= 0 ? 1 : 2,
        points: Math.abs(delta),
        points_before: (u as any).points - delta,
        points_after: (u as any).points,
        source: body.source ?? 'admin_adjust',
        remark: body.remark ?? '',
        operator: 'admin',
        create_time: now(),
      });
      return u;
    },
  },
  {
    method: 'POST',
    pattern: '/member/points/batch-operate',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.member_ids ?? body.ids)) {
        const u = crud.find(MEMBER_USERS, id);
        if (!u) continue;
        const delta = Number(body.points ?? 0);
        (u as any).points += delta;
        MEMBER_POINTS.unshift({
          id: nextId(),
          member_id: u.id,
          username: (u as any).username,
          nickname: (u as any).nickname,
          type: delta >= 0 ? 1 : 2,
          points: Math.abs(delta),
          points_before: (u as any).points - delta,
          points_after: (u as any).points,
          source: 'admin_adjust',
          remark: body.remark ?? '',
          operator: 'admin',
          create_time: now(),
        });
      }
      return null;
    },
  },
  {
    method: 'GET',
    pattern: '/member/points/rules',
    handler: () => POINT_RULES,
  },
  {
    method: 'POST',
    pattern: '/member/points/rules',
    handler: ({ body }: Ctx) => {
      Object.assign(POINT_RULES, body);
      return POINT_RULES;
    },
  },
  ...crudRoutes('/member/points', MEMBER_POINTS, {
    searchFields: ['username', 'nickname'],
    filterFields: ['type', 'member_id', 'source'],
  }),
];

// ==================== 会员标签 ====================

const memberTagRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/member/tag/enabled',
    handler: () => MEMBER_TAGS.filter((t) => t.status === 1),
  },
  {
    method: 'PUT',
    pattern: '/member/tag/update-sort',
    handler: ({ body }: Ctx) => {
      for (const row of body.rows ?? body ?? []) {
        const t = crud.find(MEMBER_TAGS, row.id);
        if (t) t.sort = Number(row.sort ?? t.sort);
      }
      return null;
    },
  },
  {
    method: 'GET',
    pattern: '/member/tag/:tagId/menu-ids',
    handler: ({ params }: Ctx) => TAG_MENU_IDS.get(Number(params[0])) ?? [],
  },
  {
    method: 'GET',
    pattern: '/member/tag/:tagId/excluded-members',
    handler: ({ params }: Ctx) => {
      const tagId = Number(params[0]);
      const list = MEMBER_USERS.filter(
        (u) => !(u.tag_ids ?? []).includes(tagId),
      );
      return { items: list.map(memberBrief), total: list.length };
    },
  },
  {
    method: 'GET',
    pattern: '/member/tag/:tagId/members',
    handler: ({ params }: Ctx) => {
      const tagId = Number(params[0]);
      const list = MEMBER_USERS.filter((u) =>
        (u.tag_ids ?? []).includes(tagId),
      );
      return { items: list.map(memberBrief), total: list.length };
    },
  },
  {
    method: 'POST',
    pattern: '/member/tag/batch-assign',
    handler: ({ body }: Ctx) => {
      const tagId = Number(body.tag_id);
      const add = toIds(body.member_ids ?? body.add_member_ids);
      const remove = toIds(body.remove_member_ids);
      for (const id of add) {
        const u = crud.find(MEMBER_USERS, id);
        if (u && !(u.tag_ids ?? []).includes(tagId)) {
          u.tag_ids = [...(u.tag_ids ?? []), tagId];
        }
      }
      for (const id of remove) {
        const u = crud.find(MEMBER_USERS, id);
        if (u) u.tag_ids = (u.tag_ids ?? []).filter((t) => t !== tagId);
      }
      for (const t of MEMBER_TAGS) {
        if (t.id === tagId)
          t.member_count = MEMBER_USERS.filter((u) =>
            (u.tag_ids ?? []).includes(tagId),
          ).length;
      }
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/member/:tagId/permissions',
    handler: ({ body, params }: Ctx) => {
      TAG_MENU_IDS.set(Number(params[0]), (body.menu_ids ?? []).map(Number));
      return null;
    },
  },
  ...crudRoutes('/member/tag', MEMBER_TAGS, {
    searchFields: ['name'],
    filterFields: ['status'],
    newRow: (data) => ({
      id: nextId(),
      name: data.name ?? '',
      color: data.color ?? 'blue',
      description: data.description ?? '',
      member_count: 0,
      sort: Number(data.sort ?? 0),
      status: Number(data.status ?? 1),
      create_time: now(),
    }),
  }),
];

// ==================== 定时任务 ====================

const crontabRoutes: RouteDef[] = [
  {
    method: 'PUT',
    pattern: '/ops/crontab/:id/resume',
    handler: ({ params }: Ctx) => {
      const c = crud.find(CRONTABS, params[0]);
      if (c) c.enabled = 1;
      return c ?? null;
    },
  },
  {
    method: 'PUT',
    pattern: '/ops/crontab/:id/pause',
    handler: ({ params }: Ctx) => {
      const c = crud.find(CRONTABS, params[0]);
      if (c) c.enabled = 0;
      return c ?? null;
    },
  },
  {
    method: 'PUT',
    pattern: '/ops/crontab/:id/execute',
    handler: ({ params }: Ctx) => {
      const c = crud.find(CRONTABS, params[0]);
      if (!c) return null;
      c.running_times += 1;
      c.last_running_time = now();
      CRONTAB_LOGS.unshift({
        id: nextId(),
        crontab_id: c.id,
        crontab_title: c.title,
        status: 1,
        output: '手动执行成功（mock）',
        exec_time: now(),
        exec_duration: '0.8s',
        created_at: now(),
        updated_at: now(),
      });
      return c;
    },
  },
  ...crudRoutes('/ops/crontab', CRONTABS, {
    searchFields: ['title', 'biz_id'],
    filterFields: ['enabled', 'type'],
  }),
  ...crudRoutes('/ops/crontab-log', CRONTAB_LOGS, {
    searchFields: ['crontab_title'],
    filterFields: ['status', 'crontab_id'],
  }),
];

// ==================== 网关（限流/黑名单） ====================

const gatewayRoutes: RouteDef[] = [
  ...crudRoutes('/ops/rate-limiter', RATE_LIMITERS, {
    searchFields: ['name', 'path'],
    filterFields: ['enabled'],
  }),
  ...crudRoutes('/ops/rate-restrictions', BLACKLISTS, {
    searchFields: ['name', 'ip'],
    filterFields: ['enabled'],
  }),
];

// ==================== 日志 ====================

const logRoutes: RouteDef[] = [
  ...crudRoutes('/ops/login-log', LOGIN_LOGS, {
    searchFields: ['user_name', 'ip'],
    filterFields: ['status'],
  }),
  ...crudRoutes('/ops/operate-log', OPERATE_LOGS, {
    searchFields: ['name', 'user_name', 'url'],
    filterFields: ['app', 'method'],
  }),
];

// ==================== 监控 ====================

const monitorRoutes: RouteDef[] = [
  route('GET', '/ops/server', () => SERVER_INFO),
  route('GET', '/ops/redis', () => REDIS_INFO),
];

// ==================== Web 站点 ====================

const webRoutes: RouteDef[] = [
  ...crudRoutes('/web/link', WEB_LINKS, {
    searchFields: ['name'],
    filterFields: ['status'],
  }),
  ...crudRoutes('/web/menu', WEB_MENUS, {
    searchFields: ['name', 'title'],
    filterFields: ['type'],
  }),
];

// ==================== 会员签到 / 系统管理员类型 ====================

const miscRoutes: RouteDef[] = [
  ...crudRoutes('/member-sign/membersign', MEMBER_SIGNS, {
    searchFields: ['sign_date'],
    filterFields: ['member_id'],
  }),
  ...crudRoutes('/sys-admin-type/sysadmintype', SYS_ADMIN_TYPES, {
    searchFields: ['name', 'code'],
  }),
];

export default [
  ...memberUserRoutes,
  ...memberAuthRoutes,
  ...memberLevelRoutes,
  ...memberPointsRoutes,
  ...memberTagRoutes,
  ...crontabRoutes,
  ...gatewayRoutes,
  ...logRoutes,
  ...monitorRoutes,
  ...webRoutes,
  ...miscRoutes,
] as RouteDef[];
