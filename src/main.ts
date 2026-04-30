import App from './App.vue'
import { createApp } from 'vue'
import { initStore } from './store'                 // Store
import { initRouter } from './router'               // Router
import VxeUIBase, { VxeUI } from 'vxe-pc-ui'
import 'vxe-pc-ui/es/style.css'
import VxeUITable from 'vxe-table'
import 'vxe-table/es/style.css'
import VxeUIPluginRenderElement from '@vxe-ui/plugin-render-element'
import '@vxe-ui/plugin-render-element/dist/style.css'
import language from './locales'                    // 国际化
import '@styles/core/tailwind.css'                  // tailwind
import '@styles/index.scss'                         // 样式
import '@utils/sys/console.ts'                      // 控制台输出内容
import { setupGlobDirectives } from './directives'
import { setupErrorHandle } from './utils/sys/error-handle'
import { registerViewComponentToVxe } from './components/view/component-map'
import { registerAllApps } from './plugins/app-registry';

(async () => {
  if ((import.meta as any).env.VITE_APP_ICON_OFFLINE === 'true') {
    await import('@/utils/load-icon');
  }
})();

document.addEventListener(
  'touchstart',
  function () { },
  { passive: false }
)



function bootstrap() {
  VxeUI.use(VxeUIPluginRenderElement)
  registerViewComponentToVxe(VxeUI)
  const app = createApp(App)
  app.use(VxeUIBase)
  app.use(VxeUITable)
  initStore(app)
  initRouter(app)
  setupGlobDirectives(app)
  setupErrorHandle(app)
  app.use(language)

  // 自动扫描并注册所有 apps 插件
  registerAllApps(app);

  app.mount('#app')
}

bootstrap()