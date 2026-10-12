import type { Ctx, RouteDef } from './types';

import { now } from '../utils/admin/store';
import { failWith, paginate } from '../utils/admin/response';
import { RAW, route } from './types';

// ==================== 本地数据 ====================

/** 授权信息（运行时可变） */
const AUTH_INFO: Record<string, any> = {
  company_name: 'MaDong 科技有限公司',
  domain: 'www.madong.tech',
  auth_code: 'MD-AUTH-2026-XXXX-XXXX-8F3A',
};

/** 插件开发列表（PluginRow） */
const DEV_PLUGINS: Record<string, any>[] = [
  {
    id: 'workflow',
    key: 'workflow',
    title: '工作流',
    desc: '可视化流程设计、审批流转、流程监控',
    author: 'MaDong',
    version: '1.2.0',
    type: 'madong:plugin',
    status: 1,
    icon: '',
    cover: '',
    installed_at: '2026-01-01 10:00:00',
    created_at: 1_767_225_600,
    updated_at: 1_767_225_600,
  },
  {
    id: 'codegen',
    key: 'codegen',
    title: '代码生成器',
    desc: '基于数据库表一键生成前后端 CRUD 代码',
    author: 'MaDong',
    version: '1.0.3',
    type: 'madong:plugin',
    status: 1,
    icon: '',
    cover: '',
    installed_at: '2026-01-01 10:00:00',
    created_at: 1_767_225_600,
    updated_at: 1_767_225_600,
  },
  {
    id: 'demo-plugin',
    key: 'demo_plugin',
    title: '示例插件',
    desc: '用于二次开发参考的示例插件骨架',
    author: 'developer',
    version: '0.1.0',
    type: 'madong:app',
    status: 0,
    icon: '',
    cover: '',
    installed_at: null,
    created_at: 1_767_225_600,
    updated_at: 1_767_225_600,
  },
];

/** 模块市场（ModuleRow） */
const MARKET_MODULES: Record<string, any>[] = [
  {
    code: 'workflow',
    key: 'workflow',
    name: '工作流',
    version: '1.2.0',
    description: '可视化流程设计、审批流转、流程监控',
    author: 'MaDong',
    icon: '',
    cover: '',
    type: 'plugin',
    is_installed: 1,
    is_purchased: 1,
    category: '效率',
    install_status: 'installed',
  },
  {
    code: 'codegen',
    key: 'codegen',
    name: '代码生成器',
    version: '1.0.3',
    description: '基于数据库表一键生成前后端 CRUD 代码',
    author: 'MaDong',
    icon: '',
    cover: '',
    type: 'plugin',
    is_installed: 1,
    is_purchased: 1,
    category: '开发',
    install_status: 'installed',
  },
  {
    code: 'cms',
    key: 'cms',
    name: '内容管理系统',
    version: '2.1.0',
    description: '文章、栏目、标签、SEO 全站内容管理',
    author: 'MaDong',
    icon: '',
    cover: '',
    type: 'app',
    is_installed: 0,
    is_purchased: 0,
    category: '内容',
    install_status: 'not_installed',
  },
  {
    code: 'crm',
    key: 'crm',
    name: '客户关系管理',
    version: '1.5.2',
    description: '客户、商机、合同、跟进一体化管理',
    author: 'MaDong',
    icon: '',
    cover: '',
    type: 'app',
    is_installed: 0,
    is_purchased: 0,
    category: '业务',
    install_status: 'not_installed',
  },
  {
    code: 'payment',
    key: 'payment',
    name: '支付中心',
    version: '1.0.8',
    description: '微信、支付宝聚合支付与退款对账',
    author: 'MaDong',
    icon: '',
    cover: '',
    type: 'plugin',
    is_installed: 0,
    is_purchased: 1,
    category: '业务',
    install_status: 'purchasable',
  },
];

/** 市场保留 key（避免与子模块路由冲突） */
const RESERVED_KEYS = ['develop', 'auth-info', 'check-environment'];

/** 升级日志（按 code 索引） */
function mockUpgradeLogs(code: string) {
  return {
    version_list: [
      {
        version_no: '1.2.0',
        release_time: '2026-06-01 10:30',
        is_important: 1,
        upgrade_log: '<p>新增流程版本管理；优化审批性能；修复若干问题。</p>',
      },
      {
        version_no: '1.1.0',
        release_time: '2026-03-15 14:00',
        is_important: 0,
        upgrade_log: '<p>支持撤回与加签；补充操作日志。</p>',
      },
      {
        version_no: '1.0.0',
        release_time: '2026-01-01 09:00',
        is_important: 0,
        upgrade_log: '<p>首个正式版本发布。</p>',
      },
    ],
  };
}

// ==================== 插件开发 ====================

function devRow(row: Record<string, any>) {
  return {
    ...row,
    installed_at: row.installed_at ?? null,
  };
}

const developRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/plugin/develop',
    handler: ({ query }: Ctx) => {
      let list = DEV_PLUGINS;
      const kw = query.LIKE_title ?? query.LIKE_desc ?? query.keyword;
      if (kw) {
        list = list.filter(
          (p) =>
            String(p.title).includes(String(kw)) ||
            String(p.desc ?? '').includes(String(kw)),
        );
      }
      if (query.EQ_status !== undefined && query.EQ_status !== '') {
        list = list.filter((p) => String(p.status) === String(query.EQ_status));
      }
      // develop 前端契约：{ list, total }
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? query.pageSize ?? 20);
      const start = (page - 1) * limit;
      return {
        list: list.slice(start, start + limit).map(devRow),
        total: list.length,
      };
    },
  },
  {
    method: 'POST',
    pattern: '/plugin/develop',
    handler: ({ body }: Ctx) => {
      const row = {
        id: body.key ?? `plugin_${Date.now()}`,
        key: body.key ?? '',
        title: body.title ?? '',
        desc: body.desc ?? '',
        author: body.author ?? '',
        version: body.version ?? '1.0.0',
        type: body.type ?? 'madong:plugin',
        status: Number(body.status ?? 1),
        icon: body.icon ?? '',
        cover: body.cover ?? '',
        installed_at: null,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      };
      DEV_PLUGINS.unshift(row);
      return devRow(row);
    },
  },
  {
    method: 'DELETE',
    pattern: '/plugin/develop',
    handler: ({ body }: Ctx) => {
      const ids: string[] = Array.isArray(body) ? body : (body.ids ?? []);
      for (const id of ids) {
        const idx = DEV_PLUGINS.findIndex((p) => String(p.id) === String(id));
        if (idx >= 0) DEV_PLUGINS.splice(idx, 1);
      }
      return null;
    },
  },
  {
    method: 'POST',
    pattern: '/plugin/develop/:id/build',
    handler: ({ params }: Ctx) => {
      const row = DEV_PLUGINS.find((p) => String(p.id) === String(params[0]));
      return {
        success: Boolean(row),
        message: row ? '打包完成（mock）' : '插件不存在',
        file: row ? `${row.key}-${row.version}.zip` : '',
      };
    },
  },
  {
    method: 'GET',
    pattern: '/plugin/develop/:id',
    handler: ({ event, params }: Ctx) => {
      const row = DEV_PLUGINS.find((p) => String(p.id) === String(params[0]));
      return row ? devRow(row) : failWith(event, '插件不存在', -1);
    },
  },
  {
    method: 'PUT',
    pattern: '/plugin/develop/:id',
    handler: ({ body, event, params }: Ctx) => {
      const row = DEV_PLUGINS.find((p) => String(p.id) === String(params[0]));
      if (!row) return failWith(event, '插件不存在', -1);
      // 标识（key）创建后不可修改
      const { key: _key, id: _id, ...fields } = body;
      Object.assign(row, fields);
      row.updated_at = Math.floor(Date.now() / 1000);
      return devRow(row);
    },
  },
  {
    method: 'DELETE',
    pattern: '/plugin/develop/:id',
    handler: ({ params }: Ctx) => {
      const idx = DEV_PLUGINS.findIndex(
        (p) => String(p.id) === String(params[0]),
      );
      if (idx >= 0) DEV_PLUGINS.splice(idx, 1);
      return null;
    },
  },
];

// ==================== 授权信息 ====================

const authInfoRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/plugin/auth-info',
    handler: () => AUTH_INFO,
  },
  {
    method: 'POST',
    pattern: '/plugin/auth-info',
    handler: ({ body }: Ctx) => {
      if (body.auth_code) AUTH_INFO.auth_code = body.auth_code;
      if (body.auth_secret) AUTH_INFO.auth_secret = body.auth_secret;
      AUTH_INFO.bound_at = now();
      return AUTH_INFO;
    },
  },
];

// ==================== 模块市场 ====================

const marketRoutes: RouteDef[] = [
  // 静态路径必须先于 /plugin/:key 注册
  route('GET', '/plugin/check-environment', () => ({
    paths: [
      { path: 'runtime/', requirement: 'writable', status: 1 },
      { path: 'storage/', requirement: 'writable', status: 1 },
      { path: 'public/install/', requirement: 'writable', status: 1 },
    ],
  })),
  {
    method: 'GET',
    pattern: '/plugin',
    handler: ({ query }: Ctx) => {
      let list = MARKET_MODULES;
      const kw = query.keyword;
      if (kw) {
        list = list.filter(
          (m) =>
            String(m.name).includes(String(kw)) ||
            String(m.code).includes(String(kw)),
        );
      }
      if (query.type && query.type !== 'all') {
        list = list.filter((m) => m.type === query.type);
      }
      return paginate(list, query);
    },
  },
  {
    method: 'GET',
    pattern: '/plugin/:key/upgrade-logs',
    handler: ({ params }: Ctx) => mockUpgradeLogs(params[0]),
  },
  {
    method: 'GET',
    pattern: '/plugin/:key/download',
    handler: ({ event }: Ctx) => {
      event.node.res.setHeader('Content-Type', 'application/zip');
      event.node.res.setHeader(
        'Content-Disposition',
        'attachment; filename="module.zip"',
      );
      event.node.res.end(Buffer.from('mock module zip', 'utf-8'));
      return RAW;
    },
  },
  {
    method: 'GET',
    pattern: '/plugin/:key',
    handler: ({ event, params }: Ctx) => {
      const key = String(params[0]);
      if (RESERVED_KEYS.includes(key)) {
        return failWith(event, '模块不存在', -1);
      }
      const row = MARKET_MODULES.find((m) => m.code === key || m.key === key);
      return row ?? failWith(event, '模块不存在', -1);
    },
  },
  {
    method: 'DELETE',
    pattern: '/plugin/:key',
    handler: ({ params }: Ctx) => {
      const idx = MARKET_MODULES.findIndex(
        (m) => String(m.code) === String(params[0]),
      );
      if (idx >= 0) {
        MARKET_MODULES.splice(idx, 1);
      }
      return null;
    },
  },
];

export default [...developRoutes, ...authInfoRoutes, ...marketRoutes];
