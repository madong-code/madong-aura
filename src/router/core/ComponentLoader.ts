/**
 * 组件加载器
 *
 * 负责动态加载 Vue 组件
 *
 * @module router/core/ComponentLoader
 * @author Art Design Pro Team
 */

import { h } from 'vue'

// ---------------------------------------------------------------------------
// 【art-admin 改造 · 对齐 vben 方案】
//
// 原生 art 的 ComponentLoader 在每次 transform() 时都 `new ComponentLoader()`
// 重建 3 个惰性 import.meta.glob，且 load() 对每个 component 推导出多个候选
// 路径逐个查 map + 试错动态 import —— 登录后一次性注册几十个路由时会层层
// await 懒加载，造成明显卡顿，且候选试错容易漏配/拼错路径导致 404。
//
// 此处改为对齐 template/admin（vben）的 buildPageMap 思路：
//   - 一次性（模块加载期）把全部页面用 import.meta.glob 预构建成全局映射表
//     pageMap（key 为去除前缀、可预测的物理路径）；
//   - load() 仅做 map 查找 + 多策略兜底，零候选试错、零重复 glob 构建，
//     因此注册路由时不再有逐个动态 import 的开销。
//
// 相对基准：本文件位于 `src/router/core/`，
//   ../../views   -> src/views（admin 业务页面 + _core 基础视图/iframe）
//   ../../plugin  -> src/plugin（admin 插件页面）
// 说明：art 原生演示页面（原 src/core/ui/demos/art）已按 _core/plugin 模式
//      迁移，不再从 core/ui/demos 加载，故不再 glob core/ui/demos。
// ---------------------------------------------------------------------------

// 预构建全局页面映射表（一次构建，模块加载期完成）
const PAGES = import.meta.glob([
  '../../views/**/*.vue',
  '../../plugin/**/*.vue',
])

/**
 * 把 glob 的物理路径（'../../views/system/user/index.vue'）规范成可预测的
 * 查询 key（'views/system/user/index' / 'views/system/user/index/index' 等）。
 * 用于后续的精确匹配与多策略兜底。
 */
function normalizeGlobKey(globPath: string): string {
  return globPath
    .replace(/^\.\.\/\.\.\//, '') // 去 '../../'
    .replace(/\.vue$/, '') // 去 '.vue'
}

// 反向索引：物理路径 -> loader，构建一次
const PAGE_MAP = new Map<string, () => Promise<any>>()
Object.keys(PAGES).forEach((globPath) => {
  PAGE_MAP.set(normalizeGlobKey(globPath), PAGES[globPath] as () => Promise<any>)
})

/**
 * 【art-admin 改造】布局容器路径别名
 *
 * 后端菜单沿用 art 原生约定，用这些路径表示"布局容器"而非真实页面。
 * 迁移后统一指向 `src/core/ui/layout/AppLayout.vue`。
 */
const LAYOUT_ALIASES = new Set(['index/index', 'index', 'Layout', 'layout'])

/**
 * 多策略兜底解析（对齐 vben 的 findMatchingComponent）。
 *
 * 【关键】PAGE_MAP 的 key 带 glob 物理前缀（`views/`、`plugin/`），
 * 而后端下发的 component（经 adapter 归一化）去掉了这些前缀（如 `system/user/index`、
 * `examples/tables/basic`、`plugin/portal/views/xxx`）。因此所有候选都必须补回
 * 对应前缀，才能与 PAGE_MAP 的 key 同构命中。
 *
 *  1. 精确匹配（含 .vue / index，补前缀）
 *  2. 模块级模糊（'system/user/index' -> 命中 'views/system/user/index/index'）
 *  3. 路径后缀模糊（'system/user' -> 命中 'views/system/user/index'）
 */
function resolveComponentPath(raw: string): string | undefined {
  const cleaned = raw.replace(/^\//, '').replace(/\.vue$/, '')

  // 候选前缀集合：业务页/基础视图走 views/，plugin 页已是 plugin/ 开头（无需再补）。
  const prefixes = cleaned.startsWith('plugin/')
    ? ['']
    : ['views/']

  // 1. 精确匹配（含 .vue / index）
  const exactCandidates: string[] = []
  for (const p of prefixes) {
    exactCandidates.push(`${p}${cleaned}`)
    exactCandidates.push(`${p}${cleaned}/index`)
    exactCandidates.push(`${p}${cleaned}.vue`)
    exactCandidates.push(`${p}${cleaned}/index.vue`)
  }
  for (const c of exactCandidates) {
    if (PAGE_MAP.has(c)) return c
  }

  // 2. 模块级模糊：去掉最后一段作为模块入口
  const segs = cleaned.split('/')
  if (segs.length >= 2) {
    const moduleKey = segs.slice(0, -1).join('/')
    const last = segs[segs.length - 1]
    const moduleCandidates: string[] = []
    for (const p of prefixes) {
      moduleCandidates.push(`${p}${moduleKey}/${last}/index`)
      moduleCandidates.push(`${p}${moduleKey}/${last}`)
      moduleCandidates.push(`${p}${moduleKey}/index`)
    }
    for (const c of moduleCandidates) {
      if (PAGE_MAP.has(c)) return c
    }
  }

  // 3. 路径后缀模糊：'system/user' -> 'views/system/user/index'
  for (const p of prefixes) {
    const prefixCleaned = `${p}${cleaned}`
    for (const key of PAGE_MAP.keys()) {
      if (key === `${prefixCleaned}/index` || key.startsWith(`${prefixCleaned}/`)) {
        return key
      }
    }
  }

  return undefined
}

export class ComponentLoader {
  /**
   * 加载组件
   *
   * componentPath 支持以下格式：
   *  - admin 业务页：'views/system/user/index' 或 '/system/user/index'（去前缀后在 src/views 找）
   *  - admin 插件页：'plugin/portal/views/xxx'（在 src/plugin 找，保留 plugin 前缀）
   *  - art 原生页：'/examples/tables/basic' 或 'examples/tables/basic'（在 src/art/views 找）
   */
  load(componentPath: string): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent()
    }

    // 布局容器别名拦截
    if (LAYOUT_ALIASES.has(componentPath.replace(/^\//, '').replace(/\.vue$/, ''))) {
      return this.loadLayout()
    }

    // 统一交给 resolveComponentPath（内部按前缀补 views/plugin）
    const raw = componentPath.replace(/^\//, '').replace(/\.vue$/, '')
    const resolved = resolveComponentPath(raw)
    if (resolved && PAGE_MAP.has(resolved)) {
      return PAGE_MAP.get(resolved)!
    }

    console.error(`[ComponentLoader] 未找到组件: ${componentPath}`)
    return this.createErrorComponent(componentPath)
  }

  /**
   * 加载布局组件
   */
  loadLayout(): () => Promise<any> {
    return () => import('#/core/ui/layout/AppLayout.vue')
  }

  /**
   * 加载 RouterView 容器组件
   *
   * 用于目录型路由（有 children 但无具体页面组件），
   * 对齐 admin 的 generateRoutesByBackend 中
   * `if (!component && route.children) route.component = layoutMap.RouteView` 逻辑。
   * 缺少这一步会导致父级渲染链断裂，子路由无法挂载 → 404。
   */
  loadRouteView(): () => Promise<any> {
    return () => import('vue-router').then((m) => m.RouterView)
  }

  /**
   * 加载 iframe 组件
   */
  loadIframe(): () => Promise<any> {
    return () => import('#/views/_core/iframe.vue')
  }

  /**
   * 创建空组件
   */
  private createEmptyComponent(): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', {})
        }
      })
  }

  /**
   * 创建错误提示组件
   */
  private createErrorComponent(componentPath: string): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', { class: 'route-error' }, `组件未找到: ${componentPath}`)
        }
      })
  }
}
