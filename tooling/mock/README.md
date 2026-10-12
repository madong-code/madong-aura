# MaDong Admin Mock 服务器（Nitro）

为前端提供无后端独立运行能力，接口契约与真实后端（adminapi）对齐，切换后端无需改前端代码。

## 启动

`pnpm dev` 启动前端时会由 vite 插件自动拉起本 mock（端口 5320），无需单独启动。
手动启动备用：

```bash
pnpm mock        # nitro dev tooling/mock
```

登录账号：`admin / 123456`（参数名为 `user_name`，不是 `username`）。

## 目录结构

```
mock/
├── handlers/            # 路由处理器（按域拆分，全部在 index.ts 汇总）
│   ├── auth.ts          # 登录 / 用户信息 / user-menus / perm-code
│   ├── system.ts        # 系统管理 + crudRoutes 工厂定义
│   ├── business.ts      # 组织架构 / 会员 / 运维
│   ├── content.ts       # 消息平台 / 审核 / 记事本文档
│   ├── devtools.ts      # 终端 / 语言 / IP
│   ├── codegen.ts       # 代码生成 / 数据表
│   ├── plugin.ts        # 模块市场 / 插件开发 / 授权信息
│   └── types.ts         # RouteDef / Ctx / RAW / route() 等公共类型
├── routes/adminapi/[...].ts   # 请求分发：认证 → 匹配路由 → 信封包装
└── utils/admin/
    ├── datasets.ts      # 全部 mock 数据集（字典、菜单、会员、规则…）
    ├── menu-data.ts     # 菜单树 / vbenMenus / PERM_CODES
    ├── menu-seed.json   # 菜单种子（改菜单结构只动这里）
    ├── auth.ts          # 用户 / token
    └── response.ts      # paginate / filterBy(EQ_/LIKE_) / ok / failWith
```

## 核心约定

### 响应信封

处理器返回值会被自动包装为 `{ code: 0, msg: 'ok', data: ... }`。以下情况不包装：

- 返回值已含 `{ code, msg, data }` 三字段（视为完整信封，如 `failWith(event, 'xx', -1)`）
- 返回 `RAW`（处理器自行输出，如文件流 / SSE）
- 业务数据里若本身有 `code` 字段（职位编码、插件 key）**不受影响**，判断信封要求三字段齐全

### 分页

列表接口返回 `{ items, total }`（`paginate(list, query)`，识别 `page/limit`）。 **例外**：插件开发 `/plugin/develop` 列表契约是 `{ list, total }`。

### 查询参数（与后端对齐）

| 前缀 | 语义 | 示例 |
| --- | --- | --- |
| `EQ_xxx` | 精确匹配 | `EQ_type=1` |
| `LIKE_xxx` | 模糊匹配（忽略大小写） | `LIKE_title=记事本` |
| `keyword` / `name` | 多字段模糊（searchFields + code + title） | — |

`filterBy(list, query, fields)` 统一解析以上前缀；`fields` = filterFields + searchFields，需与前端页面 searchForm 的 fieldName 保持一致。

## 新增一个 CRUD 模块（推荐方式）

1. **datasets.ts** 定义数据集（自增 id，含 `created_at/updated_at`）：

```ts
export const WIDGETS: Record<string, any>[] = [
  { id: 1, name: '示例', enabled: 1, created_at: T0, updated_at: T0 },
];
```

2. **对应 handler 文件** 用 `crudRoutes` 工厂注册（自动获得 list/create/update/delete/batchDelete/detail）：

```ts
...crudRoutes('/system/widget', WIDGETS, {
  searchFields: ['name'],        // LIKE_ 搜索字段
  filterFields: ['enabled'],     // EQ_ 精确字段
  // serialize: (row) => ({ ...row, dept: ... }),  // 输出加工（详情/更新/列表）
  // listOverride: (ctx, list) => ...,              // 完全接管列表
  // newRow: {...},               // POST 缺省字段
}),
```

3. handler 文件中 export 数组，并在 `handlers/index.ts` 汇总。

## 字典（列表 tags 显示）

前端通过 `GET /system/dict/options/by-type?dict_type=xxx` 拉取，mock 已实现。字典定义在 datasets.ts 的 `dict()` 调用，**code 必须与前端 `DictEnum` 一致**，状态类字典项带 `color`（green/red/orange/blue）供 CellDictTag 着色：

```ts
dict('common.EnabledStatus', '系统开关', 'sys', [
  ['启用', '1', 'green'],
  ['禁用', '0', 'red'],
]);
```

新增页面字典：先在 `src/enums/dict-enum.ts` 确认 code，再到 datasets.ts 补 `dict()`。

## 菜单 / 权限

- 菜单结构只改 **menu-seed.json**：`is_show: 0` 隐藏菜单（路由仍可 URL 访问）、`type` 1 目录 / 2 菜单 / 3 按钮 / 4 路由
- `vbenMenus()` 过滤 type 3/4 并转 vben 格式；`hideInMenu = !is_show`
- 权限码 `/system/auth/perm-code` 输出 `PERM_CODES`（菜单全部 code + `EXTRA_PERM_CODES`）。前端按钮用 `auth: 'xxx'` 控制显隐时，若种子无对应按钮节点，把码加到 menu-data.ts 的 `EXTRA_PERM_CODES`

## 路由定义（菜单管理→选择权限）

- `/system/rule-cate`：分类树，**必须带 `label` 字段**（ElTree 读取）+ `children: []`
- `GET /system/rule`：支持 `cate_id` + `keyword` 过滤，规则含 `cate_id/method/path/title/code`
- 刷新缓存：`POST /system/rule/refresh`

## 常见坑

1. `replaceAll` 传正则必须加 `g` 标志，否则模块初始化时 nitro 直接崩溃
2. 热重载多次后可能出现 `Cannot access 'xx' before initialization` —— 重启 mock 服务器即可
3. 路由匹配按参数数排序，静态路径先注册；`/plugin/develop` 与 `/plugin/:key` 同级冲突时，在 handler 内用保留字（RESERVED_KEYS）兜底
4. 新增接口后先 curl 验证信封结构（`"code":0`）再到前端联调
