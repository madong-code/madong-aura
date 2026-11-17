# template/aura 架构与适配指南

> **核心立场：不管后端是标准单体还是 SaaS，都建议什么都不删。**
> 本模板沿用 `template/admin` 的「后端驱动开关 + 前端条件接入」方案：单体后端不提供租户能力 → 前端自动静默租户路径，零成本兼容。
> 删减带来的收益（几个文件、几十 KB 体积）远小于风险（漏删 import、断依赖、未来想扩展还要加回来）。

---

## 一、本模板与 admin 的关系

aura 是 MaDong Admin 的另一套后台 UI（art-design-pro 框体 + 双 UI 维护 + 插件无缝复用），与 `template/admin` 共用同一后端契约：
- API 前缀同为 `/adminapi/*`，鉴权同为 `Authorization: Bearer` + `X-Tenant-Id`
- 菜单同为后端驱动：`GET /system/auth/user-menus` → 动态注册路由
- 站点配置同为 `GET /system/config/code/site_setting`

差别在框架层：
| 能力 | template/admin | template/aura |
|---|---|---|
| 框架核心 | `src/core/`（Vben） | `src/core/`（art 系） |
| 布局 | `src/layouts/basic.vue` | `src/core/ui/layout/components/app-header-bar/index.vue` |
| 登录页 | schema 驱动 `AuthenticationLogin` | 手写 `ElForm`（`src/views/auth/login/index.vue`） |
| 用户态 | `core/stores` + `store/auth.ts` 单体系 | `core/stores`（业务 token）+ `store/modules/user.ts`（容器态）双体系 |
| 请求静默开关 | `silent` | `skipGlobalErrorHandler`（等价） |
| 插件 | 无内置业务插件 | `src/plugin/*`（11 个插件），标准版超集保留 |

---

## 二、兼容三层机制（与 admin 同构）

### 2.1 请求层：`src/api/request.ts` 租户 header 条件注入

```ts
if (accessStore.tenantId &&
    !config.url?.startsWith('/tenant') &&
    !config.url?.startsWith('/db-settings') &&
    !config.url?.startsWith('/db-drivers') &&
    !config.url?.startsWith('/subscription') &&
    !config.url?.startsWith('/auth/site-info')
) {
  config.headers['X-Tenant-Id'] = String(accessStore.tenantId);
}
```

- `accessStore.tenantId` 默认 `null`（`core/stores/modules/access.ts`）
- 标准后端不返回租户信息、登录响应无 `tenant` 字段 → `tenantId` 恒 `null` → header 永不发送
- **标准版零配置生效**

### 2.2 登录页：`src/views/auth/login/index.vue` 租户字段条件渲染

**租户运行模式由 `VITE_GLOB_TENANT_MODE` 控制**（`.env` 默认 `auto`）：

| 取值 | 行为 | 是否请求 `/auth/tenant-mode` |
|---|---|---|
| `auto`（默认） | 探测后端决定租户开关 | 是（404 静默失败 → 关闭） |
| `standard` | 强制标准版，租户开关恒关 | **否**（省一次 404） |
| `saas` | 强制多租户，租户开关恒开 | **否** |

> 用 `VITE_GLOB_` 前缀：生产构建注入 `_app.config.js`，部署后可直接改该文件切换模式，无需重新构建。

```ts
const { tenantMode } = useAppConfig(import.meta.env, import.meta.env.PROD);
const tenantEnabled = ref(false);
async function fetchTenantMode() {
  if (tenantMode === 'standard') { tenantEnabled.value = false; return; } // 不请求
  if (tenantMode === 'saas') { tenantEnabled.value = true; return; }       // 不请求
  const mode = await getTenantModeFlagApi(); // auto：404 时静默返回 {enabled:false}
  tenantEnabled.value = mode.enabled ?? false;
  tenantAutoFirst.value = mode.auto_select_first ?? false;
}
```

```html
<ElFormItem v-if="tenantEnabled" prop="tenantCode">
  <TenantSearcher v-model="formData.tenantCode" />
</ElFormItem>
```

- 标准后端无 `/auth/tenant-mode` → `getTenantModeFlagApi` 带 `skipGlobalErrorHandler: true` → 静默失败返回关闭态 → 租户框不渲染
- 提交时 `if (tenantEnabled && tenantCode) params.tenant_code = tenantCode`，标准后端登录参数零变化
- 登录成功后从响应 `tenant.id` 写入 `accessStore.setTenantId`，请求层随即具备租户上下文

### 2.3 菜单/路由：后端驱动，前端注册

```
后端 menus → GET /system/auth/user-menus → 动态 addRoute
```

- 标准后端菜单表无 `/tenant`、租户插件市场等入口 → 前端不注册路由
- 即使 `views/` 存在相关 `.vue`，永远不会被访问到 → 不出现侧边栏、不 404、不触发 import

---

## 三、本次为共存新增/修改的租户接入点

### 3.1 请求与状态（标准/多租户同一份）

| 文件 | 改动 | 标准版表现 |
|---|---|---|
| `src/api/request.ts` | 请求拦截器加 `X-Tenant-Id` 条件注入 | `tenantId=null` → 不注入 |
| `src/core/stores/modules/access.ts` | 加 `tenantId: null \| number \| string` + `setTenantId`，纳入持久化 | 恒为 `null` |
| `src/store/auth.ts` | 登录存 `tenantId`；退出清空；新增 `fetchTenantList` / `switchTenant` | 方法存在但 never called |

### 3.2 API（同源路径，与 admin 一致）

`src/api/auth/login/index.ts` 新增：

| 方法 | 路径 | 用途 | 标准版 |
|---|---|---|---|
| `getTenantModeFlagApi` | `GET /auth/tenant-mode` | 租户模式探测（静默） | 404 静默 → 关闭 |
| `getTenantPageApi` | `GET /auth/tenants` | 登录前租户分页搜索 | 不调用 |
| `getUserTenantListApi` | `GET /system/auth/tenant-list` | 已登录租户列表 | 不调用 |
| `switchTenantApi` | `POST /system/auth/switch-tenant` | 切换租户 | 不调用 |

`LoginResult` 增加可选 `tenant` 字段（标准后端不返回）。

### 3.3 组件与布局

| 文件 | 作用 | 标准版表现 |
|---|---|---|
| `src/components/tenant-searcher/index.vue` | 登录页租户搜索器（按 code/name 搜索，提交 code） | 不渲染 |
| `src/components/tenant-switch/tenant-switch-modal.vue` | 顶部栏租户切换弹窗（ElDialog，仅多租户挂载） | `tenantId=null` → 不挂载 |
| `src/core/ui/layout/components/app-header-bar/index.vue` | 顶部栏加切换按钮（`v-if="showTenantSwitch"`） | 按钮不渲染 |

### 3.4 多语言

| 文件 | key 前缀 |
|---|---|
| `src/lang/{zh-CN,en-US}/tenant.json` | `tenant.searcher.*`、`tenant.switch.*` |

`src/locales/loader/index.ts` 自动扫描 `lang/**/*.json`，无需改 loader。

---

## 四、对齐 admin 的站点信息接口

登录前品牌信息统一走 `GET /auth/site-info`（`src/api/request.ts` 跳过租户上下文注入）：
- SaaS 后端：取平台分组 `site_setting`
- 标准后端：已在 `madong/backend` 补 `getSiteInfo`，取 `group_code=default` 的 `site_setting`
- 两端接口同名 → 前端单次请求，无需降级

aura 的 `src/store/modules/site-config.ts` 为单份平台配置（`syncSitePreferences`），登录前后统一走 `/auth/site-info`（匿名）。
> **重要**：切勿改回 `/system/config/code/site_setting`——该接口在 adminapi 端是 `requireToken: true`，登录前匿名请求必然 401 → 触发重新认证 → 动态路由注册失败 → 落入 `#/500` 死锁（需手动点返回首页）。`/auth/site-info` 两端均匿名可访问，是登录前唯一正确入口。

多租户下如需租户级品牌，可后续参照 admin 补 `tenantConfig` 双份配置；当前不影响共存。

---

## 四·补、两个已修复的排障记录

### 4.1 401 落入 `#/500` 死锁
`request-client.ts` 非 2xx 时抛的是**纯响应体** `{code, msg}`（无 `response` 属性）。
- `router/guards/beforeEach.ts` 的 `isUnauthorizedError` 原先只看 `error.response.data.code` → 识别不了 → 落入 `Exception500`
- `core/request/request-client/preset-interceptors.ts` 的 `authenticateResponseInterceptor` 同理漏判 → 不触发重新认证

**已修复**：两处都加上 `error.code === 401/402` 判断，兼容纯响应体形态。

### 4.2 401 跳登录页后白屏
aura 是**双 store 体系**：core `accessStore`（key `${ns}-core-access`）+ 容器 `userStore`（key `user`）。
`authStore.logout()` 原先只清 core accessStore，硬跳转重载后容器 `userStore.isLogin` 从持久化恢复为 `true`
→ 路由守卫当成已登录 → 用空 token 注册动态路由 → 401 → `next(false)` → 登录页白屏。

**已修复**：`store/auth.ts` 的 `logout()` 显式重置容器 `userStore`（`setLoginStatus(false)` + `setToken('','')`），persist 插件写回。

---

## 五、不管是单体还是 SaaS，都不要动的

| 文件 | 理由 |
|---|---|
| `src/api/request.ts` 的 `X-Tenant-Id` 条件 | `tenantId=null` 时自动跳过，两端同一份代码 |
| `src/store/auth.ts` 的 `switchTenant` 等方法 | 标准后端永不调用，零副作用 |
| `src/core/stores/modules/access.ts` 的 `tenantId` | 类型 `null \| number \| string`，默认 `null`，不影响单体 |
| `package.json` / `pnpm-workspace.yaml` | 依赖框架级，不区分单体/SaaS |
| `src/plugin/*` | 标准版超集，保留插件能力 |

---

## 六、快速验证清单

选择「什么都不删」时，用以下步骤确认标准后端零依赖：

```bash
pnpm dev
```

1. F12 Console 无 `TenantSearcher` / `TenantSwitchModal` import 报错
2. 登录页不出现租户搜索框 → `/auth/tenant-mode` 404 静默 → `tenantEnabled=false`
3. 登录后任意请求不带 `X-Tenant-Id` → `tenantId=null` 条件跳过
4. 侧边栏无租户/订阅入口 → 后端菜单表过滤
5. 顶部栏无租户切换按钮 → `showTenantSwitch=false`
6. 手输 `/tenant/...` 走 404 fallback 而非白屏 → 路由未注册
7. 登录页品牌信息正常 → `/auth/site-info` 标准后端已补齐

全通 → 一份代码双后端共存达成。
