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
import { viteVisualFormElementPlusPlugin } from './build/vite/plugins/visual-form'
import { viteTailwindReferencePlugin } from './build/vite/plugins/tailwind-reference'
// import { visualizer } from 'rollup-plugin-visualizer'

// 可视化表单设计器依赖的 UMD 产物，插件会扫描它生成虚拟模块
const VISUAL_FORM_UMD_PATH = fileURLToPath(
  new URL('lib/visual-form/designer.umd.js', import.meta.url)
)

// 只预构建真正用到的 Element Plus 组件样式，避免 dev 冷启动极慢
const ELEMENT_PLUS_STYLE_DEPS = [
  'radio-group',
  'segmented',
  'select-v2',
  'space',
  'switch',
  'table',
  'time-picker',
  'tree-select',
  'upload'
].map((component) => `element-plus/es/components/${component}/style/css`)

export default ({ mode }: { mode: string }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const {
    VITE_VERSION,
    VITE_PORT,
    VITE_BASE_URL,
    VITE_API_URL,
    VITE_API_PROXY_URL,
    VITE_GLOB_API_URL,
    VITE_PROXY_TARGET
  } = env

  // admin 业务层通过 VITE_GLOB_API_URL 作为请求前缀（默认 /adminapi），
  // dev 下由这里的 proxy 转发到真实后端 VITE_PROXY_TARGET
  const apiPrefix = VITE_GLOB_API_URL || '/adminapi'
  const proxyTarget = VITE_PROXY_TARGET || VITE_API_PROXY_URL

  console.log(`🚀 API_URL      = ${VITE_API_URL}`)
  console.log(`🚀 GLOB_API_URL = ${apiPrefix}  ->  ${proxyTarget}`)
  console.log(`🚀 VERSION      = ${VITE_VERSION}`)

  return defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION)
    },
    base: VITE_BASE_URL,
    server: {
      port: Number(VITE_PORT),
      proxy: {
        // admin 业务层接口：/adminapi/xxx -> http://127.0.0.1:8500/adminapi/xxx
        // 关键：target 只用 proxyTarget（不含 /adminapi），
        // 浏览器发来的完整路径 /adminapi/system/auth/login 会原样拼到 target 后，
        // 形成 http://127.0.0.1:8500/adminapi/system/auth/login，
        // 正好匹配后端 webman 带 /adminapi 前缀的路由。
        // （之前写成 target=`${proxyTarget}${apiPrefix}` 会把前缀拼两次，
        //  变成 /adminapi/adminapi/... 而 404。）
        [apiPrefix]: {
          target: proxyTarget,
          changeOrigin: true,
          ws: true
        },
        // 附件上传/静态资源
        '/upload': {
          target: proxyTarget,
          changeOrigin: true
        },
        // 旧 art 壳原生接口（/api/xxx）：统一转发到真实后端并改写为 /adminapi 前缀，
        // 避免任何残留 /api 请求落到已废弃的 mock 服务。
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/adminapi')
        }
      },
      watch: {
        ignored: ['**/.dbg/**', '**/tooling/mock/.nitro/**']
      },
      host: true
    },
    // 路径别名
    resolve: {
      alias: {
        // admin(vben)体系别名：迁移过来的 views/plugin/components/api 均使用 #/
        // 注意 #lib 必须排在 # 之前，否则会被 # 抢先匹配
        // 说明：`@vben/tailwind-config` 不在这里配 alias。
        // core 样式里的 `@reference "@vben/tailwind-config/theme"` 由
        // @tailwindcss/vite 自己的解析器处理（走 node_modules 解析）；
        // 配 vite alias 反而会让 theme.css 内 `@source '../../../src/'`
        // 的相对路径基准发生变化。
        // 本地副本已通过
        //   pnpm add @vben/tailwind-config@file:./tooling/tailwind-config
        // 注册为真实的包，见 tooling/tailwind-config/。
        '#lib': fileURLToPath(new URL('./lib', import.meta.url)),
        '#': fileURLToPath(new URL('./src', import.meta.url)),
        // ---------------------------------------------------------------
        // 别名策略：全部使用 #/ 实际路径引用（指向 src/）。
        // 原 art-design-pro 的 '@/xxx' 模块别名已全部移除，
        // 所有 art 代码已迁入 src/core/* 并以 #/core/... 实际路径引用。
        // 仅保留资源类别名（@imgs/@icons/@styles），供 scss @use 与模板资源引用。
        // ---------------------------------------------------------------
        '@imgs': resolvePath('src/assets/images'),
        '@icons': resolvePath('src/assets/icons'),
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
        include: ['src/views/**/*.vue', 'src/plugin/**/*.vue']
      }
    },
    plugins: [
      // 提供 virtual:visual-form-element-plus 虚拟模块（core/plugins/visual-form 依赖）
      viteVisualFormElementPlusPlugin({ umdPath: VISUAL_FORM_UMD_PATH }),
      vue(),
      vueJsx(),
      // 必须在 tailwindcss() 之前：向含 @apply 的 Vue SFC <style> 注入
      // @reference "@vben/tailwind-config/theme"，让 bg-card / border-border /
      // text-muted-foreground 等 admin 主题 token 能被解析。
      viteTailwindReferencePlugin(),
      tailwindcss(),
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
      // 自动按需导入组件
      // 注意：dirs 必须限定为 art 自有组件目录（已迁入 src/core/ui/*）。
      // 迁移自 admin 的 #/components 使用显式 import，若放开全量扫描会与其产生
      // 大量同名冲突（Dialog / Select / Input / Upload 等），导致组件被忽略。
      Components({
        dts: 'src/types/import/components.d.ts',
        dirs: [
          'src/core/ui/components/art',
          'src/core/ui/layout',
          'src/core/ui/menu',
          'src/core/ui/tabs'
        ],
        resolvers: [ElementPlusResolver()]
      }),
      // 按需定制主题配置
      ElementPlus({
        useSource: true
      }),
      // 压缩
      viteCompression({
        verbose: false, // 是否在控制台输出压缩结果
        disable: false, // 是否禁用
        algorithm: 'gzip', // 压缩算法
        ext: '.gz', // 压缩后的文件名后缀
        threshold: 10240, // 只有大小大于该值的资源会被处理 10240B = 10KB
        deleteOriginFile: false // 压缩后是否删除原文件
      }),
      vueDevTools()
      // 打包分析
      // visualizer({
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: 'dist/stats.html' // 分析图生成的文件名及路径
      // }),
    ],
    // 依赖预构建：避免运行时重复请求与转换，提升首次加载速度
    //
    // 【art-admin 改造 · 热启动优化】
    // 原 art 模板的 optimizeDeps 含 `element-plus/es` + `element-plus/es/components/*/style/css`
    // + `element-plus/es/components/*/style/index` 三个通配项，会强制预构建 Element Plus
    // 全部组件（上百个），导致 dev 冷启动极慢。改为与 template/admin 一致的「精确组件列表」
    // 方式：只预构建真正用到的组件样式，其余交给 unplugin-element-plus 按需解析。
    optimizeDeps: {
      include: [
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'echarts/features',
        'crypto-js',
        'file-saver',
        'zod',
        'vee-validate',
        '@vee-validate/zod',
        ...ELEMENT_PLUS_STYLE_DEPS
      ]
    },
    css: {
      preprocessorOptions: {
        // sass variable and mixin
        scss: {
          // 【art-admin 修复】additionalData 改为函数形式，只注入到项目自身的
          // SCSS 文件（src/ 下），不注入到 node_modules 中的 SCSS 文件。
          //
          // 原因：之前是无条件注入，当 vxe-table 的 cssvar.scss 被编译时，
          // 注入的 `@use "@styles/core/el-light.scss"` 因 el-light.scss 不存在
          // 导致 SCSS 编译失败，vxe-table 的 CSS 变量（--vxe-ui-font-size-small
          // 等）未被输出，.vxe-grid 的 font-size 回退到继承值 16px，
          // 表格视觉比 admin（13px）偏大。
          //
          // 同时移除了对不存在的 el-light.scss 的引用。
          additionalData: (content: string, filepath: string) => {
            const isNodeModules = filepath.includes('node_modules')
            if (isNodeModules) {
              return content
            }
            return `@use "@styles/core/mixin.scss" as *;\n${content}`
          }
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
