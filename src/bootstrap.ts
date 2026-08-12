/**
 * 应用启动引导（art-admin）
 *
 * art-admin = art-design-pro（UI 壳） + admin（业务层）
 *
 * 启动顺序很重要，这里做了明确编排：
 *
 * 1. 创建 app 实例
 * 2. 安装 art 的 pinia（**唯一** pinia 实例，含持久化插件）
 * 3. 用同一个 pinia 初始化 admin 业务层的 store 容器（不重复 createPinia）
 * 4. 初始化 admin 的 preferences（core/request、core/access 等依赖它）
 * 5. 初始化 admin 的组件适配器（CRUD / Form / Modal / Drawer 用到）
 * 6. 安装 i18n（唯一实例，来自 #/core/locales，art 语言包已合并进去）
 * 7. 安装 art 的路由（含前置/后置守卫）与全局指令、错误处理
 * 8. 挂载
 *
 * 样式加载顺序同样重要，见文件下方的 import 注释。
 *
 * @module bootstrap
 */
import type { App as VueApp } from 'vue';

import { createApp } from 'vue';

import { initStores } from '#/core/stores';
import { initPreferences } from '#/core/preferences';

import App from './App.vue';
import { store } from '#/core/stores';
import { initRouter } from '#/router';
import { setupErrorHandle } from '#/core/shared/art-utils/sys/error-handle';
import { mergeArtMessages } from '#/core/locales/art';
import { overridesPreferences } from './preferences';
import { setupI18n } from './locales';
import { initComponentAdapter } from './adapter/component';
import { initSetupVbenForm } from './adapter/form';
import { setupGlobDirectives } from '#/core/directives';

// ---------------------------------------------------------------------
// 样式加载顺序（**不要随意调整**）
//
// 1. admin core 的 design tokens 与组件样式
//    提供 --primary / --background / --border 等 HSL 变量，
//    是 admin 组件 `bg-primary`、`text-foreground` 的取值来源。
// 2. art 的 Tailwind（产出唯一一份 utilities）
// 3. art 的全局 scss（reset / element-plus 覆写 / 布局）
//
// art 放在后面 => 同名 token 与全局样式以 art 为准，
// 保证「UI 布局与观感完全是 art-design-pro」这一目标。
// ---------------------------------------------------------------------
import '#/core/design/styles';
import '@styles/core/tailwind.css';
import '@styles/index.scss';
// 控制台输出
import '#/core/shared/art-utils/sys/console';

/**
 * 命名空间：用于 preferences / store 的缓存前缀，避免多应用串数据
 */
const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${import.meta.env.VITE_APP_VERSION}`;

/**
 * 启动应用
 */
export async function bootstrap(): Promise<VueApp<Element>> {
  const app = createApp(App);

  // ---- 2. 唯一 pinia（art 壳创建，带 StorageKeyManager 持久化）----
  app.use(store);

  // ---- 3. admin 业务层复用同一个 pinia ----
  await initStores(app, { namespace, pinia: store });

  // ---- 4. admin preferences ----
  await initPreferences({
    namespace,
    overrides: overridesPreferences,
  });

  // ---- 5. 组件适配器（必须早于任何 CRUD/Form 渲染）----
  await initComponentAdapter();
  // 初始化表单组件：setupVbenForm 会把 globalShareState 里的组件注册进
  // form 的 COMPONENT_MAP（Input/ApiDict/Select 等）。缺少这一步会导致
  // Crud 搜索表单等字段 "Component Input is not registered"、无法渲染。
  await initSetupVbenForm();

  // ---- 6. i18n（唯一实例；art 语言包合并进 zh-CN / en-US）----
  await setupI18n(app);
  // 必须在 setupI18n 之后：核心的 loadLocaleMessages 用 setLocaleMessage 整体覆盖
  mergeArtMessages();

  // ---- 7. 路由 + 指令 + 错误处理 ----
  // vxe-table 由 #/adapter/vxe-table 在被 CRUD 组件引用时自动初始化，无需在此注册
  initRouter(app);
  setupGlobDirectives(app);
  setupErrorHandle(app);

  // ---- 8. 挂载 ----
  app.mount('#app');

  return app;
}
