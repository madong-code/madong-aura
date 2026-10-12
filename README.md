# MaDong-Aura

> [English → README.en.md](./README.en.md)

---

**MaDong-Aura** 是 [MaDong Admin](https://github.com/madong-code/madong-admin) 后端框架的配套前端 UI，同时也是一个可独立运行的后台管理模版。业务层结构、请求契约、插件机制与参考项目 madong-single 完全一致，仅取 art-design-pro 的框体布局，支持双 UI 维护与插件无缝复用。

- 🏠 **项目仓库：** <https://github.com/madong-code/madong-aura>

### ✨ 特性

- **🔌 插件系统** — 插件目录（`src/plugin/`）支持通过后端菜单动态注册，或在开发环境通过 `routes/index.ts` 静态声明，业务组件、API、Mock 均可按插件独立打包
- **🎯 独立模版** — 内置 Nitro Mock 服务器（端口 5320），接口契约与真实后端完全对齐，无需启动后端即可完整运行和学习
- **🧩 CRUD 组件** — 开箱即用的列表/表单/弹窗/抽屉组件，支持 vxe-table 高级功能（虚拟滚动、单元格编辑、树形表格等）
- **🎨 设计器** — 集成 VForm3 表单设计器（UMD）和 LogicFlow 流程设计器（ESM），开箱即用
- **🌐 多语言** — 完整的 zh-CN / en-US 双语支持，插件 i18n 按目录自动加载
- **🔐 权限控制** — 前端/后端两种权限模式，支持角色权限码、按钮级鉴权（v-access / v-roles 指令）
- **📦 双模式构建** — 支持独立域名（`pnpm build`）和同域子路径（`pnpm build:integrated`）两种部署方式

### 🛠 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3.5 · TypeScript · Vite 7 |
| 状态管理 | Pinia 3 |
| UI | Element Plus 2.13（按需）· Tailwind CSS v4 · ReKa UI |
| 表格 | vxe-table 4 |
| 图表 | ECharts 6 |
| 富文本 | Tiptap 3 · WangEditor 5 |
| 流程图 | LogicFlow |
| 表单设计 | VForm3（UMD）|
| 国际化 | Vue I18n 11 |
| Mock | Nitro 2（API 契约对齐 adminapi）|
| 路由 | Vue Router 4 |
| 网络 | Axios |

### 🚀 快速开始

**环境要求：** Node.js >= 22 · pnpm >= 10

```bash
# 安装依赖
pnpm install

# 启动开发（前端 :5500 + Mock :5320 自动拉起）
pnpm dev
```

**默认登录：** `admin / 123456`（用户名参数为 `user_name`）

手动 Mock 命令：

```bash
pnpm mock          # 单独启动 Mock 服务器
pnpm mock:build    # 构建 Mock 产物
```

### 📦 构建与部署

| 模式 | 命令 | base | API | 场景 |
| --- | --- | --- | --- | --- |
| 开发 | `pnpm dev` | `/` | Mock `:5320` | 本地开发 · 学习 |
| 生产（独立域名） | `pnpm build` | `/` | `/adminapi`（网关转发） | 独立部署 |
| 生产（同域） | `pnpm build:integrated` | `/admin/` | 相对 `/adminapi` | 嵌入 PHP 项目子路径 |

**切换真实后端：** 将 `.env.development` 中的 `VITE_NITRO_MOCK` 设为 `false`，代理目标指向真实后端（默认 `http://127.0.0.1:8500`），无需修改前端代码。

### 📂 目录结构

```
madong-aura/
├── build/plugins/          # Vite 构建插件（Nitro Mock 自动拉起、UMD 静态资源处理）
├── tooling/mock/           # Nitro Mock 服务（:5320，接口契约对齐 adminapi）
│   ├── handlers/           # 路由处理器（auth / system / plugin / content …）
│   └── utils/admin/        # Mock 数据集、菜单种子、JWT 工具
├── lib/                    # 外部设计器静态产物
│   ├── visual-form/        # VForm3 UMD 表单设计器
│   └── visual-flow/        # LogicFlow ESM 流程设计器
├── public/                 # 静态资源（favicon、logo）
└── src/
    ├── core/               # 框架适配层（不依赖具体业务）
    │   ├── ui/             # 容器 UI：布局 / 弹窗 / 表单原语
    │   ├── config/         # 容器配置：系统信息 / 设置面板
    │   ├── utils/          # 容器工具：路由导航 / 存储 / 事件总线
    │   ├── composables/    # 全局组合式函数
    │   ├── directives/     # v-access / v-roles / v-auth 指令
    │   ├── plugins/        # 插件封装：ECharts / Tiptap / vxe-table / Motion
    │   ├── stores/         # 框架 Store（access / user）
    │   └── preferences/    # 偏好设置
    ├── adapter/            # UI 适配层（对 madong-single 保持一致的 API）
    ├── api/                # 业务 API 层（与 madong-single 结构逐字对齐）
    │   ├── auth/ system/ member/ ops/ content/ web/ devtools/ app/
    │   └── request.ts      # Axios 封装
    ├── components/         # 业务组件（与 madong-single 同构，供插件复用）
    │   ├── crud/           # CRUD 表格组件
    │   ├── dialog/         # 弹窗组件
    │   ├── form/           # 表单组件
    │   ├── page/           # 页面容器
    │   ├── icon/ render/
    ├── views/              # 业务页面（结构对齐 madong-single）
    │   ├── auth/           # 登录 / 注册
    │   ├── system/         # 系统管理（用户 / 角色 / 菜单 / 字典 …）
    │   ├── ops/            # 运维（Redis / 服务器 / 日志 / 定时任务）
    │   ├── member/         # 会员管理
    │   ├── web/            # 官网菜单 / 链接
    │   ├── content/        # 消息 / 记事本
    │   └── index/          # 工作台
    ├── plugin/             # 插件目录
    │   └── demo/           # 示例插件（37 个页面，覆盖 CRUD / 表单 / vxe-table / 控件）
    ├── router/             # 路由（含插件扫描器）
    ├── store/              # 业务 Store（menu / dict / setting / worktab …）
    ├── lang/ enums/ utils/ types/ locales/
    ├── assets/styles/
    └── main.ts             # 入口
```

### 🔌 插件系统

插件放置于 `src/plugin/<plugin-name>/` 目录，结构如下：

```
plugin/demo/
├── routes/index.ts      # 开发环境路由定义（生产环境由后端菜单驱动）
├── views/               # 插件页面（相对路径由 component 字段解析）
└── mock/api.ts          # 插件级 Mock 数据（可选）
```

**component 路径解析支持以下格式（按优先级匹配）：**

| 格式 | 示例 | 解析结果 |
| --- | --- | --- |
| 完整标准路径 | `plugin/demo/views/crud/basic` | `src/plugin/demo/views/crud/basic/index.vue` |
| 冒号简写 | `demo:crud/basic` | `src/plugin/demo/views/crud/basic/index.vue` |
| `{module}/views/` 形态 | `demo/views/crud/basic` | `src/plugin/demo/views/crud/basic/index.vue` |
| 最简写法 + `meta.module` | `crud/basic`（module=`demo`） | `src/plugin/demo/views/crud/basic/index.vue` |
| BasicLayout | `BasicLayout` | 框架内置布局（根节点专用，**不得带 `meta.module`**） |

**生产环境：** 后端安装插件时自动写入 `sys_menu` 并注入 `meta.module = '<plugin-name>'`，前端从 `GET /system/auth/user-menus` 获取菜单后由插件扫描器动态加载组件。

**开发环境：** 插件可在 `routes/index.ts` 中静态声明路由（见 demo 插件），无需后端配置即可预览。

**插件市场 API：** `src/api/app/plugin/market/` 提供模块市场列表、安装、购买等接口类型。

### 🧪 Mock 开发

本项目使用 Nitro 提供完整的 Mock 服务，接口契约与 MaDong Admin 真实后端（adminapi）完全对齐，切换后端时无需修改前端代码。

详细约定与开发指南请参考 [tooling/mock/README.md](./tooling/mock/README.md)。

核心要点：

- **响应信封：** `{ code: 0, msg: 'ok', data: ... }`，列表接口返回 `{ items, total }`
- **查询参数：** `EQ_xxx` 精确匹配、`LIKE_xxx` 模糊匹配、`keyword` 多字段搜索
- **新增 CRUD：** 在 `handlers/` 中使用 `crudRoutes()` 工厂，自动获得完整增删改查
- **菜单种子：** 菜单结构仅修改 `menu-seed.json`，权限码定义在 `menu-data.ts`

### ⚙️ 环境变量

关键配置在 [.env](./.env) 中定义：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_PORT` | `5500` | 前端开发端口 |
| `VITE_BASE_URL` | `/` | 部署基础路径（同域部署需改为 `/admin/`）|
| `VITE_ACCESS_MODE` | `backend` | 权限模式（`frontend` / `backend`）|
| `VITE_GLOB_API_URL` | `/adminapi` | API 前缀 |
| `VITE_NITRO_MOCK` | `true` | 是否启用本地 Mock（生产环境默认 `false`）|
| `VITE_APP_TITLE` | `Aura-Plus` | 应用标题 |
| `VITE_APP_NAMESPACE` | `aura` | 缓存/Store 隔离命名空间 |

### 📜 License

[MIT](./LICENSE) © SuperManTT
