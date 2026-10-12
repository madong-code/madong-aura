import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { fileURLToPath } from 'url'
import vueDevTools from 'vite-plugin-vue-devtools'
import viteCompression from 'vite-plugin-compression'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import { viteNitroMockPlugin } from './build/plugins/nitro-mock'
import { viteVisualFormElementPlusPlugin } from './build/plugins/visual-form'
// import { visualizer } from 'rollup-plugin-visualizer'

// VForm3 设计器 UMD（visual-form 插件运行时动态注入），vite 插件扫描其中的 EP 组件依赖
const VISUAL_FORM_UMD_PATH = fileURLToPath(
  new URL('./lib/visual-form/designer.umd.js', import.meta.url)
)

// 枚举 element-plus 全部组件的样式入口并预构建，
// 避免访问新页面时 Vite 反复发现新依赖触发整页 reload
const ELEMENT_PLUS_COMPONENT_DIRS = fs
  .readdirSync(path.resolve(__dirname, 'node_modules/element-plus/es/components'), {
    withFileTypes: true
  })
  .filter((d) => {
    if (!d.isDirectory()) return false
    // 同时存在 css 入口与 scss 源入口（useSource:true 时业务侧实际走 scss）
    return fs.existsSync(
      path.resolve(
        __dirname,
        `node_modules/element-plus/es/components/${d.name}/style/css.mjs`
      )
    )
  })
  .map((d) => d.name)

// 编译后 css 入口 + scss 源入口全部在启动时预打包：
// 否则运行中首次用到未预热的组件会触发 "new dependencies optimized → reloading"，
// 重载竞态导致 tabs.scss / descriptions.scss 等 net::ERR_ABORTED
const ELEMENT_PLUS_STYLE_DEPS = ELEMENT_PLUS_COMPONENT_DIRS.flatMap((name) => [
  `element-plus/es/components/${name}/style/css`,
  `element-plus/es/components/${name}/style/index`
])

export default ({ command, mode }: { command: string; mode: string }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const { VITE_VERSION, VITE_PORT, VITE_BASE_URL, VITE_API_URL, VITE_NITRO_MOCK } = env

  console.log(`🚀 API_URL = ${VITE_API_URL}`)
  console.log(`🚀 GLOB_API_URL = ${env.VITE_GLOB_API_URL}`)
  console.log(`🚀 NITRO_MOCK = ${VITE_NITRO_MOCK}`)
  console.log(`🚀 VERSION = ${VITE_VERSION}`)

  // 与 madong-single 一致：mock 走本地 Nitro 5320，否则走真实后端 8500
  const useMock = (VITE_NITRO_MOCK ?? 'true') !== 'false'
  const proxy = useMock
    ? {
        '/adminapi': {
          target: 'http://localhost:5320',
          changeOrigin: true,
          ws: true
        },
        '/api': {
          target: 'http://localhost:5320',
          changeOrigin: true
        },
        '/upload': {
          target: 'http://localhost:5320',
          changeOrigin: true
        }
      }
    : {
        '/adminapi': {
          target: 'http://127.0.0.1:8500/adminapi',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/adminapi/, ''),
          ws: true
        },
        '/api': {
          target: 'http://127.0.0.1:8500',
          changeOrigin: true
        },
        '/upload': {
          target: 'http://127.0.0.1:8500',
          changeOrigin: true
        }
      }

  return defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION)
    },
    base: VITE_BASE_URL,
    server: {
      port: Number(VITE_PORT || 5500),
      proxy,
      host: true
    },
    // 路径别名：'#/*' 与 madong-single 保持一致，业务文件零差异
    resolve: {
      alias: {
        '#': fileURLToPath(new URL('./src', import.meta.url)),
        '#lib': fileURLToPath(new URL('./lib', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@views': resolvePath('src/views'),
        '@imgs': resolvePath('src/assets/images'),
        '@icons': resolvePath('src/assets/icons'),
        '@utils': resolvePath('src/utils'),
        '@stores': resolvePath('src/store'),
        '@styles': resolvePath('src/assets/styles')
      }
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      chunkSizeWarningLimit: 2000,
      minify: 'terser',
      terserOptions: {
        compress: {
          // 生产环境去除 console
          drop_console: true,
          // 生产环境去除 debugger
          drop_debugger: true
        }
      },
      dynamicImportVarsOptions: {
        warnOnError: true,
        exclude: [],
        include: ['src/views/**/*.vue']
      }
    },
    plugins: [
      vue(),
      vueJsx(),
      tailwindcss(),
      // visual-form 插件：虚拟模块注入 VForm3 UMD 依赖的 Element Plus 组件
      viteVisualFormElementPlusPlugin({
        umdPath: VISUAL_FORM_UMD_PATH
      }),
      // dev 模式单进程内拉起 tooling/mock 的 Nitro mock（对齐 madong-single）；
      // 生产构建 / VITE_NITRO_MOCK=false 时不启用
      ...(command === 'serve' && useMock ? [viteNitroMockPlugin()] : []),
      // 自动按需导入 API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'src/types/import/auto-imports.d.ts',
        resolvers: [ElementPlusResolver()],
        eslintrc: {
          enabled: true,
          filepath: './.auto-import.json',
          globalsPropValue: true
        }
      }),
      // 仅自动注册 app 外壳组件；madong 业务组件（src/components/crud 等）一律显式 import
      Components({
        // 容器组件归属框架层 src/core/ui/*（layout 布局/authentication 认证/fallback 异常/result 结果）；
        // AppThemeSvg 单独按目录纳入；src/components 与 madong-single 保持一致
        // （crud/dialog/form/icon/page/render），业务组件全部手动 import，
        // 不纳入自动注册以免与复用插件冲突
        dirs: [
          'src/core/ui/layout',
          'src/core/ui/authentication',
          'src/core/ui/fallback',
          'src/core/ui/result',
          'src/core/ui/common/components/app-theme-svg'
        ],
        dts: 'src/types/import/components.d.ts',
        resolvers: [ElementPlusResolver()]
      }),
      // 按需定制主题配置
      ElementPlus({
        useSource: true
      }),
      // 压缩
      viteCompression({
        verbose: false,
        disable: false,
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240,
        deleteOriginFile: false
      }),
      vueDevTools()
      // 打包分析
      // visualizer({
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: 'dist/stats.html'
      // }),
    ],
    optimizeDeps: {
      include: [
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'crypto-js',
        '@iconify/vue',
        // 仅显式预打包编译后的 css.mjs；
        // 不能整包 include 'element-plus/es'：esbuild 会把 useSource 注入的
        // components/*/style/index（scss 源入口）当 JS 预打包，产出浏览器 404 的 chunk
        ...ELEMENT_PLUS_STYLE_DEPS,
        // 历史上在运行中才被发现、触发过整页 reload 的第三方依赖，启动时一并预打包
        'echarts/features',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue',
        'reka-ui',
        'class-variance-authority',
        'watermark-js-plus',
        'theme-colors',
        '@ctrl/tinycolor',
        'secure-ls',
        'qs',
        'lodash.clonedeep',
        'es-toolkit/compat',
        'defu',
        '@vue/shared',
        'vue-tippy',
        'clsx',
        'tailwind-merge',
        'vxe-pc-ui',
        'vxe-pc-ui/lib/language/en-US',
        'vxe-pc-ui/lib/language/zh-CN',
        'vxe-table',
        'dayjs',
        'dayjs/locale/en',
        'dayjs/locale/zh-cn',
        'dayjs/plugin/utc.js',
        'dayjs/plugin/timezone.js',
        'zod',
        'zod-defaults',
        'vee-validate',
        '@vee-validate/zod'
      ]
    },
    css: {
      preprocessorOptions: {
        // sass variable and mixin
        scss: {
          additionalData: `
            @use "@styles/core/el-light.scss" as *; 
            @use "@styles/core/mixin.scss" as *;
          `
        }
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      }
    }
  })
}

function resolvePath(paths: string) {
  return path.resolve(__dirname, paths)
}
