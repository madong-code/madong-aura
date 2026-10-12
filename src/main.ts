import App from './App.vue'
import { createApp } from 'vue'
import { ElLoading } from 'element-plus'
import { initRouter } from './router'               // 容器路由
import { setupI18n } from './locales'               // 统一国际化（复用 #/core/locales 单例）
import '@styles/core/tailwind.css'                  // tailwind
import '@styles/index.scss'                         // 样式
import '#/core/utils/console'                       // 控制台输出内容
import { setupGlobDirectives } from '#/core/directives'
import { setupErrorHandle } from '#/core/utils/error-handle'

import { initComponentAdapter } from '#/adapter/component'
import { initSetupVbenForm } from '#/adapter/form'
import { registerLoadingDirective } from '#/core/ui/common'
import { initPreferences } from '#/core/preferences'
import { initStores, useAccessStore } from '#/core/stores'
import { registerAccessDirective } from '#/core/access'

// vxe-table 适配器：模块加载即注册默认 grid 配置与全部 cellRenderers
import '#/adapter/vxe-table'

import { overridesPreferences } from './preferences'

document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

/**
 * 应用启动序列（app 容器层 + madong 业务底座）
 *
 * 1. core 偏好初始化（业务 #/core/preferences，含缓存合并）
 * 2. 创建 Vue 应用
 * 3. 容器 pinia + core 持久化策略（共用同一个 pinia 实例，按 core- 前缀分流）
 * 4. 统一 i18n（容器短码 zh/en 与 madong zh-CN/en-US 别名互通）
 * 5. 容器路由/守卫、全局指令、错误处理
 * 6. 业务权限指令 v-access
 */
async function initApplication() {
  const env = import.meta.env.PROD ? 'prod' : 'dev'
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${import.meta.env.VITE_VERSION}-${env}`

  // 业务偏好设置初始化
  await initPreferences({
    namespace,
    overrides: overridesPreferences
  })

  const app = createApp(App)

  // 安装 pinia（art 与 core 共用同一实例，art 持久化插件在 store 创建时已注册；
  // initStores 追加 core-* store 持久化策略：DEV 明文 / 生产 AES）
  await initStores(app, { namespace })

  // 超级权限码，拥有这些权限码的用户拥有所有权限
  const accessStore = useAccessStore()
  accessStore.setSuperCodes(['*', 'admin'])

  // 国际化（异步加载语言包后再挂载）
  await setupI18n(app)

  // 业务组件适配器（业务表单组件自动扫描注册）+ schema 表单规则
  await initComponentAdapter()
  await initSetupVbenForm()

  // 容器：路由及守卫
  initRouter(app)
  // 容器：v-auth / v-roles / v-highlight / v-ripple
  setupGlobDirectives(app)
  // 容器：全局错误处理
  setupErrorHandle(app)

  // EP 原生 v-loading 指令 + 业务 v-spinning 指令
  app.directive('loading', ElLoading.directive)
  registerLoadingDirective(app, {
    loading: false,
    spinning: 'spinning'
  })

  // 业务：madong 权限指令 v-access（与 art v-auth 并存，业务代码使用）
  registerAccessDirective(app)

  app.mount('#app')
}

initApplication()
