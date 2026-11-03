import type { PluginOption } from 'vite'

const APP_CONFIG_FILE = '_app.config.js'

interface InjectAppConfigOptions {
  /** loadEnv 加载后的环境变量（含 .env.* 的全部 VITE_ 变量） */
  env: Record<string, string>
}

/**
 * 构建时生成 `_app.config.js` 并注入 index.html：
 * 把全部 VITE_GLOB_* 变量挂到 window._VBEN_ADMIN_PRO_APP_CONF_，
 * 运行时由 src/core/composables/use-app-config.ts 从该全局对象读取。
 *
 * 与 madong-single / mono 的 vite-inject-app-config 机制一致：
 * 部署后可直接修改服务器上的 _app.config.js 调整接口地址，无需重新构建。
 */
export function viteInjectAppConfigPlugin(
  options: InjectAppConfigOptions
): PluginOption {
  return {
    name: 'vite:inject-app-config',
    apply: 'build',
    enforce: 'post',
    generateBundle() {
      const globEnvConfigs = Object.fromEntries(
        Object.entries(options.env).filter(([key]) =>
          key.startsWith('VITE_GLOB_')
        )
      )
      this.emitFile({
        type: 'asset',
        fileName: APP_CONFIG_FILE,
        source: `window._VBEN_ADMIN_PRO_APP_CONF_ = ${JSON.stringify(globEnvConfigs, null, 2)};`
      })
    },
    transformIndexHtml() {
      // body-prepend：普通同步 script 先于 type=module 入口执行，
      // 保证应用代码读 window._VBEN_ADMIN_PRO_APP_CONF_ 时已就绪；
      // 相对路径 './' 兼容任意子路径部署
      return [
        {
          tag: 'script',
          attrs: { src: `./${APP_CONFIG_FILE}` },
          injectTo: 'body-prepend'
        }
      ]
    }
  }
}
