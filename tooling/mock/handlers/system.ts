import type { Ctx, RouteDef } from './types';

import { readMultipartFormData, setHeaders } from 'h3';

import { ADMIN_USERS, createAdminRow } from '../utils/admin/auth';
import {
  CONFIG_ITEMS,
  CONFIG_VALUES,
  DEPTS,
  DICT_ITEMS,
  DICTS,
  FILES,
  POSTS,
  RECYCLES,
  ROLES,
  ROLE_MENU_IDS,
  RULE_CATES,
  RULES,
  deptTree,
} from '../utils/admin/datasets';
import { MENU_ROWS } from '../utils/admin/menu-data';
import {
  failWith,
  filterBy,
  filterByKeyword,
  paginate,
} from '../utils/admin/response';
import { crud, nextId, now, randomToken, toIds } from '../utils/admin/store';
import { RAW, route } from './types';
import { createMenuRowData } from './auth';

// ==================== 通用 CRUD 工厂 ====================

export interface CrudOptions {
  /** 自定义列表处理（返回完整 data，如 dept 树） */
  listOverride?: (ctx: Ctx, list: Record<string, any>[]) => any;
  /** 输出前脱敏 */
  serialize?: (row: Record<string, any>) => any;
  /** 关键字搜索字段 */
  searchFields?: string[];
  /** 精确过滤字段 */
  filterFields?: string[];
  /** 新建行工厂 */
  newRow?: (data: Record<string, any>) => Record<string, any>;
}

/**
 * 生成 BaseService 七件套：
 * GET 列表 / POST 新建 / GET :id / PUT :id / PUT :id/change-status
 * DELETE 批量（body.ids）/ DELETE :id
 */
export function crudRoutes(
  baseUrl: string,
  list: Record<string, any>[],
  opts: CrudOptions = {},
): RouteDef[] {
  const out = (row: Record<string, any>) =>
    opts.serialize ? opts.serialize(row) : row;

  return [
    {
      method: 'GET',
      pattern: baseUrl,
      handler: (ctx: Ctx) => {
        // EQ_/LIKE_ 前缀参数按 filterFields+searchFields 解析
        const filterable = [
          ...(opts.filterFields ?? []),
          ...(opts.searchFields ?? ['name']),
        ];
        let l = filterBy(list, ctx.query, filterable);
        l = filterByKeyword(l, ctx.query.keyword ?? ctx.query.name, [
          ...(opts.searchFields ?? ['name']),
          'code',
          'title',
        ]);
        if (opts.listOverride) return opts.listOverride(ctx, l);
        return paginate(l.map(out), ctx.query);
      },
    },
    {
      method: 'POST',
      pattern: baseUrl,
      handler: ({ body }: Ctx) => {
        const row = opts.newRow
          ? opts.newRow(body)
          : { id: nextId(), ...body, created_at: now(), updated_at: now() };
        crud.insert(list, row);
        return row;
      },
    },
    {
      method: 'GET',
      pattern: `${baseUrl}/:id`,
      handler: ({ event, params }: Ctx) => {
        const row = crud.find(list, params[0]);
        return row ? out(row) : failWith(event, '数据不存在', -1);
      },
    },
    {
      method: 'PUT',
      pattern: `${baseUrl}/:id`,
      handler: ({ event, body, params }: Ctx) => {
        const row = crud.update(list, params[0], body);
        return row ? out(row) : failWith(event, '数据不存在', -1);
      },
    },
    {
      method: 'PUT',
      pattern: baseUrl,
      handler: ({ event, body }: Ctx) => {
        // BaseService.update(对象) 无 id 时走 PUT baseUrl
        const target =
          crud.find(list, body.id ?? body[Object.keys(body)[0] ?? '']) ??
          (body.id !== undefined ? null : list[0]);
        if (!target) return failWith(event, '数据不存在', -1);
        const { id: _id, ...fields } = body;
        Object.assign(target, fields);
        target.updated_at = now();
        return out(target);
      },
    },
    {
      method: 'PUT',
      pattern: `${baseUrl}/:id/change-status`,
      handler: ({ body, params }: Ctx) => {
        const row = crud.find(list, params[0]);
        if (row) {
          if (body.field !== undefined) {
            row[body.field] = body.value;
          } else {
            Object.assign(row, body);
          }
          row.updated_at = now();
        }
        return row ?? null;
      },
    },
    {
      method: 'DELETE',
      pattern: baseUrl,
      handler: ({ body }: Ctx) => crud.remove(list, toIds(body.ids)),
    },
    {
      method: 'DELETE',
      pattern: `${baseUrl}/:id`,
      handler: ({ params }: Ctx) => crud.remove(list, [params[0]]),
    },
  ];
}

// ==================== 管理员 ====================

function sanitize(row: Record<string, any>) {
  const { password: _pwd, ...rest } = row;
  return rest;
}

const adminRoutes: RouteDef[] = [
  {
    method: 'PUT',
    pattern: '/system/admin/preferences',
    handler: ({ body, user }: Ctx) => {
      user.backend_setting = body.preferences ?? body;
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/system/admin/reset-password',
    handler: ({ body }: Ctx) => {
      const ids = toIds(body.ids ?? body.id);
      for (const id of ids) {
        const u = crud.find(ADMIN_USERS, id);
        if (u) u.password = body.password ?? '123456';
      }
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/system/admin/play-user',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids ?? body.id)) {
        const u = crud.find(ADMIN_USERS, id);
        if (u) u.enabled = 1;
      }
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/system/admin/unplay-user',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids ?? body.id)) {
        const u = crud.find(ADMIN_USERS, id);
        if (u) u.enabled = 0;
      }
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/system/admin/locked',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids ?? body.id)) {
        const u = crud.find(ADMIN_USERS, id);
        if (u) u.is_locked = 1;
      }
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/system/admin/un-locked',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids ?? body.id)) {
        const u = crud.find(ADMIN_USERS, id);
        if (u) u.is_locked = 0;
      }
      return null;
    },
  },
  {
    method: 'POST',
    pattern: '/system/admin/grant-role',
    handler: ({ body }: Ctx) => {
      const u = crud.find(ADMIN_USERS, body.admin_id ?? body.id);
      if (u) u.role_id_list = (body.role_id ?? []).map(Number);
      return null;
    },
  },
  ...crudRoutes('/system/admin', ADMIN_USERS, {
    serialize: sanitize,
    newRow: (data) => {
      const row = createAdminRow({
        user_name: data.user_name ?? '',
        password: data.password ?? '123456',
        real_name: data.real_name ?? '',
        dept_id: Number(data.dept_id ?? 0),
        role_id_list: (data.role_id ?? []).map(Number),
      });
      row.email = data.email ?? '';
      row.mobile_phone = data.mobile_phone ?? '';
      row.remark = data.remark ?? '';
      return row;
    },
    searchFields: ['user_name', 'real_name', 'email'],
    filterFields: ['dept_id', 'enabled', 'is_locked'],
  }),
];

// ==================== 角色 ====================

const roleRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/system/role/scope/dept',
    handler: () => deptTree(),
  },
  {
    method: 'PUT',
    pattern: '/system/role/:id/data-scope',
    handler: ({ body, params }: Ctx) => {
      const role = crud.find(ROLES, params[0]);
      if (role) {
        role.data_scope = Number(body.data_scope ?? 1);
        role.updated_at = now();
      }
      return role ?? null;
    },
  },
  ...crudRoutes('/system/role', ROLES, {
    searchFields: ['name'],
    filterFields: ['enabled'],
    newRow: (data) => ({
      id: nextId(),
      pid: Number(data.pid ?? 0),
      name: data.name ?? '',
      code: data.code ?? '',
      is_super_admin: 0,
      role_type: Number(data.role_type ?? 2),
      data_scope: Number(data.data_scope ?? 1),
      enabled: Number(data.enabled ?? 1),
      sort: Number(data.sort ?? 0),
      remark: data.remark ?? '',
      created_by: 1,
      updated_by: 1,
      created_at: now(),
      updated_at: now(),
      created_date: now().slice(0, 10),
      updated_date: now().slice(0, 10),
    }),
  }),
];

// ==================== 菜单 ====================

const menuRoutes: RouteDef[] = [
  {
    method: 'POST',
    pattern: '/system/menu/batch-store',
    handler: ({ body }: Ctx) => {
      const rows = Array.isArray(body) ? body : [body];
      for (const data of rows) {
        crud.insert(MENU_ROWS, createMenuRowData(data));
      }
      return null;
    },
  },
  ...crudRoutes('/system/menu', MENU_ROWS, {
    searchFields: ['title', 'code', 'path'],
    filterFields: ['type', 'app', 'enabled'],
    newRow: createMenuRowData,
  }),
];

// ==================== 部门 ====================

const deptRoutes: RouteDef[] = [
  ...crudRoutes('/system/dept', DEPTS, {
    listOverride: (ctx, list) =>
      ctx.query.format === 'tree' ? deptTree() : paginate(list, ctx.query),
    searchFields: ['name'],
    filterFields: ['enabled', 'pid'],
    newRow: (data) => ({
      id: nextId(),
      pid: Number(data.pid ?? 0),
      level: String(data.level ?? '1'),
      code: data.code ?? '',
      name: data.name ?? '',
      main_leader_id: Number(data.main_leader_id ?? 0),
      phone: data.phone ?? '',
      enabled: Number(data.enabled ?? 1),
      sort: Number(data.sort ?? 0),
      remark: data.remark ?? '',
      created_at: now(),
      updated_at: now(),
    }),
  }),
];

// ==================== 岗位 ====================

const postRoutes: RouteDef[] = [
  ...crudRoutes('/system/post', POSTS, {
    searchFields: ['name'],
    filterFields: ['dept_id', 'enabled'],
    // 关联输出部门名称（前端表格列 field: 'dept.name'）
    serialize: (row) => {
      const dept = DEPTS.find((d) => d.id === Number(row.dept_id));
      return {
        ...row,
        dept: dept ? { id: dept.id, name: dept.name } : null,
      };
    },
  }),
];

// ==================== 字典 ====================

function dictItemsByCode(code: string) {
  return DICT_ITEMS.filter((i) => i.code === code && i.enabled === 1);
}

const dictRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/system/dict/enum-dict-list',
    handler: ({ query }: Ctx) => {
      let list = DICTS;
      if (query.group_code) {
        list = list.filter((d) => d.group_code === query.group_code);
      }
      return list;
    },
  },
  {
    method: 'GET',
    pattern: '/system/dict/custom/list',
    handler: () => DICTS,
  },
  {
    method: 'GET',
    pattern: '/system/menu/app/list',
    handler: () => [
      { label: '系统管理', value: 'admin' },
      { label: 'Web 站点', value: 'web' },
      { label: 'App 端', value: 'app' },
    ],
  },
  {
    method: 'GET',
    pattern: '/system/dict/options/by-type',
    handler: ({ query }: Ctx) => {
      // 字典组件走 dict_type 参数（store/modules/dict.ts），旧参数 code 兼容
      const type = query.dict_type ?? query.code ?? '';
      return dictItemsByCode(String(type)).map((i) => ({
        label: i.label,
        value: i.value,
        color: i.color,
      }));
    },
  },
  {
    method: 'GET',
    pattern: '/system/dict/enum/list',
    handler: () =>
      Object.fromEntries(
        [...new Set(DICT_ITEMS.map((i) => i.code))].map((code) => [
          code,
          dictItemsByCode(code).map((i) => ({
            label: i.label,
            value: i.value,
          })),
        ]),
      ),
  },
  ...crudRoutes('/system/dict', DICTS, {
    searchFields: ['name', 'code'],
    filterFields: ['group_code', 'data_type', 'enabled'],
  }),
  ...crudRoutes('/system/dict-item', DICT_ITEMS, {
    searchFields: ['label'],
    filterFields: ['dict_id', 'code', 'enabled'],
  }),
];

// ==================== 站点模式 / 通用文件 ====================

const miscRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/site/mode',
    handler: () => ({ mode: 'standalone' }),
  },
  {
    method: 'GET',
    pattern: '/file/list',
    handler: ({ query }: Ctx) => {
      let list = FILES.filter((f) => f.platform === 'local');
      const kw = query.LIKE_filename ?? query.keyword;
      if (kw) {
        list = list.filter((f) =>
          String(f.original_filename).includes(String(kw)),
        );
      }
      return paginate(list, query);
    },
  },
  {
    method: 'POST',
    pattern: '/file/upload',
    handler: async ({ event }: Ctx) => {
      const parts = await readMultipartFormData(event);
      const file = parts?.find((p) => p.name === 'file');
      const t = now();
      const ext = (file?.filename ?? 'file.png').split('.').pop() ?? 'png';
      const row = {
        id: nextId(),
        url: `/upload/default/${randomToken(8)}.${ext}`,
        size: String(file?.data.length ?? 1024),
        size_info: `${Math.ceil((file?.data.length ?? 1024) / 1024)}KB`,
        hash: `hash_${randomToken(12)}`,
        filename: `${randomToken(10)}.${ext}`,
        original_filename: file?.filename ?? 'upload.png',
        base_path: '/upload',
        path: `/upload/default/${randomToken(8)}.${ext}`,
        ext,
        content_type: file?.type ?? 'image/png',
        platform: 'local',
        th_url: '',
        th_filename: '',
        th_size: '0',
        th_size_info: '0B',
        th_content_type: '',
        object_id: '',
        object_type: '',
        attr: '',
        category: '图片',
        created_by: 1,
        updated_by: 1,
        created_at: t,
        updated_at: t,
      };
      FILES.unshift(row);
      return row;
    },
  },
];

// ==================== 系统配置 ====================

const configRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/system/config/code/:code',
    public: true,
    handler: ({ params }: Ctx) => CONFIG_VALUES[params[0]] ?? null,
  },
  {
    method: 'PUT',
    pattern: '/system/config/:code',
    handler: ({ body, params }: Ctx) => {
      CONFIG_VALUES[params[0]] = body;
      const item = CONFIG_ITEMS.find((c) => c.code === params[0]);
      if (item) {
        item.value = body;
        item.updated_at = now();
      }
      return body;
    },
  },
  {
    method: 'DELETE',
    pattern: '/system/config/:code',
    handler: ({ params }: Ctx) => {
      delete CONFIG_VALUES[params[0]];
      const idx = CONFIG_ITEMS.findIndex((c) => c.code === params[0]);
      if (idx >= 0) CONFIG_ITEMS.splice(idx, 1);
      return null;
    },
  },
  {
    method: 'GET',
    pattern: '/system/config/group/:group',
    handler: ({ params }: Ctx) =>
      CONFIG_ITEMS.filter((c) => c.group_code === params[0]),
  },
  {
    method: 'GET',
    pattern: '/system/config/items',
    handler: ({ query }: Ctx) => {
      let list = CONFIG_ITEMS;
      if (query.group_code) {
        list = list.filter((c) => c.group_code === query.group_code);
      }
      return paginate(list, query);
    },
  },
  {
    method: 'POST',
    pattern: '/system/config',
    handler: ({ body }: Ctx) => {
      const item = {
        id: nextId(),
        group_code: body.group_code ?? 'system',
        code: body.code ?? '',
        name: body.name ?? body.code ?? '',
        value: body.value ?? null,
        sort: Number(body.sort ?? 0),
        enabled: Number(body.enabled ?? 1),
        created_at: now(),
        updated_at: now(),
      };
      CONFIG_ITEMS.push(item);
      CONFIG_VALUES[item.code] = item.value;
      return item;
    },
  },
];

// ==================== 文件 ====================

const fileRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/system/files/categories',
    handler: () => [
      {
        name: '图片',
        count: FILES.filter((f) => f.category === '图片').length,
      },
      {
        name: '附件',
        count: FILES.filter((f) => f.category === '附件').length,
      },
    ],
  },
  {
    method: 'POST',
    pattern: '/system/files/upload-image',
    handler: async ({ event }: Ctx) => {
      const parts = await readMultipartFormData(event);
      const file = parts?.find((p) => p.name === 'file');
      const subDir =
        parts?.find((p) => p.name === 'sub_dir')?.data.toString() ?? 'default';
      const t = now();
      const ext = (file?.filename ?? 'file.png').split('.').pop() ?? 'png';
      const row = {
        id: nextId(),
        url: `/upload/${subDir}/${randomToken(8)}.${ext}`,
        size: String(file?.data.length ?? 1024),
        size_info: `${Math.ceil((file?.data.length ?? 1024) / 1024)}KB`,
        hash: `hash_${randomToken(12)}`,
        filename: `${randomToken(10)}.${ext}`,
        original_filename: file?.filename ?? 'upload.png',
        base_path: '/upload',
        path: `/upload/${subDir}/${randomToken(8)}.${ext}`,
        ext,
        content_type: file?.type ?? 'image/png',
        platform: 'local',
        th_url: '',
        th_filename: '',
        th_size: '0',
        th_size_info: '0B',
        th_content_type: '',
        object_id: '',
        object_type: '',
        attr: '',
        category: '图片',
        created_by: 1,
        updated_by: 1,
        created_at: t,
        updated_at: t,
      };
      FILES.unshift(row);
      return row;
    },
  },
  {
    method: 'POST',
    pattern: '/system/files/upload-image-base64',
    handler: ({ body }: Ctx) => {
      const t = now();
      const row = {
        id: nextId(),
        url: body.url ?? `/upload/base64/${randomToken(8)}.png`,
        size: '1024',
        size_info: '1KB',
        hash: `hash_${randomToken(12)}`,
        filename: `${randomToken(10)}.png`,
        original_filename: body.original_filename ?? 'base64.png',
        base_path: '/upload',
        path: `/upload/base64/${randomToken(8)}.png`,
        ext: 'png',
        content_type: 'image/png',
        platform: 'local',
        th_url: '',
        th_filename: '',
        th_size: '0',
        th_size_info: '0B',
        th_content_type: '',
        object_id: '',
        object_type: '',
        attr: '',
        category: '图片',
        created_by: 1,
        updated_by: 1,
        created_at: t,
        updated_at: t,
      };
      FILES.unshift(row);
      return row;
    },
  },
  {
    method: 'GET',
    pattern: '/system/files/download-by-id/:id',
    handler: ({ event, params }: Ctx) => {
      const row = crud.find(FILES, params[0]);
      setHeaders(event, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${row?.filename ?? 'file.bin'}"`,
      });
      event.node.res.end(
        Buffer.from(`mock file content of ${params[0]}`, 'utf-8'),
      );
      return RAW;
    },
  },
  // 分片上传 5 端点（演示语义）
  {
    method: 'POST',
    pattern: '/sys/fileInfo/getFileInfoByIds',
    handler: ({ body }: Ctx) => {
      const ids = toIds(body.ids);
      return FILES.filter((f) => ids.map(String).includes(String(f.id)));
    },
  },
  {
    method: 'POST',
    pattern: '/sys/fileInfo/initiateMultipartUpload',
    handler: () => ({ upload_id: randomToken(24) }),
  },
  {
    method: 'POST',
    pattern: '/sys/fileInfo/uploadPart',
    handler: () => ({ etag: randomToken(32) }),
  },
  {
    method: 'POST',
    pattern: '/sys/fileInfo/completeMultipartUpload',
    handler: () => ({
      url: `/upload/multipart/${randomToken(8)}.bin`,
      path: `/upload/multipart/${randomToken(8)}.bin`,
    }),
  },
  {
    method: 'POST',
    pattern: '/sys/fileInfo/abortMultipartUpload',
    handler: () => null,
  },
  ...crudRoutes('/system/files', FILES, {
    searchFields: ['original_filename'],
    filterFields: ['category', 'platform'],
  }),
];

// ==================== 回收站 ====================

const recycleRoutes: RouteDef[] = [
  {
    method: 'PUT',
    pattern: '/system/recycle/restore',
    handler: ({ body }: Ctx) => {
      const ids = toIds(body.ids);
      for (const id of ids) crud.remove(RECYCLES, [id]);
      return null;
    },
  },
  ...crudRoutes('/system/recycle', RECYCLES, {
    searchFields: ['table_name'],
  }),
];

// ==================== 路由规则 ====================

const ruleRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/system/rule-cate',
    handler: ({ query }: Ctx) => {
      // keyword：按分类名/编码过滤
      const kw = query.keyword;
      let list = RULE_CATES;
      if (kw) {
        list = list.filter(
          (c) =>
            String(c.name).includes(String(kw)) ||
            String(c.code).includes(String(kw)),
        );
      }
      // 前端 ElTree :props="{ label: 'label' }"，输出 label 字段
      return list.map((c) => ({ ...c, label: c.name, children: [] }));
    },
  },
  {
    method: 'POST',
    pattern: '/system/rule/refresh',
    handler: () => ({ count: RULES.length }),
  },
  {
    method: 'GET',
    pattern: '/system/rule',
    handler: ({ query }: Ctx) => {
      // 接口列表弹窗：按分类 + 关键字检索（keyword 匹配 name/path/title）
      let list = RULES;
      const cateId = query.cate_id;
      if (
        cateId !== undefined &&
        cateId !== '' &&
        cateId !== 'null' &&
        cateId !== 'undefined'
      ) {
        list = list.filter((r) => String(r.cate_id) === String(cateId));
      }
      const kw = query.keyword;
      if (kw) {
        list = list.filter(
          (r) =>
            String(r.name).includes(String(kw)) ||
            String(r.path).includes(String(kw)) ||
            String(r.title).includes(String(kw)),
        );
      }
      return list;
    },
  },
  ...crudRoutes('/system/rule', RULES, {
    searchFields: ['name', 'path', 'title'],
    filterFields: ['method', 'type'],
  }),
];

export default [
  ...adminRoutes,
  ...roleRoutes,
  ...menuRoutes,
  ...deptRoutes,
  ...postRoutes,
  ...dictRoutes,
  ...configRoutes,
  ...fileRoutes,
  ...recycleRoutes,
  ...ruleRoutes,
  ...miscRoutes,
] as RouteDef[];
