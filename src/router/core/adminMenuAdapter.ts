/**
 * admin 后端菜单 → art 前端路由 适配器
 *
 * ---------------------------------------------------------------------------
 * 背景
 * ---------------------------------------------------------------------------
 * admin 后端返回的菜单是 `RouteRecordStringComponent[]`，字段：
 *   - path:     绝对路径，如 '/system/user'、'/'
 *   - component: 字符串组件标识
 *       · 'BasicLayout' / 'RouteView'  -> 布局 / 目录（无真实页面）
 *       · 'views/system/user/index'    -> 普通页面（无 .vue 后缀）
 *       · 'plugin/portal/views/xxx'    -> 插件页面
 *   - name:     路由名
 *   - meta:     { title, icon, hideInMenu, ... }
 *   - children: 子菜单
 *
 * art 前端路由是 `AppRouteRecord[]`，由 MenuProcessor / RouteTransformer 处理：
 *   - 顶级需要 Layout 包裹（ RoutesAlias.Layout = '/index/index' ）
 *   - component 是相对于 src 的组件路径字符串，由 ComponentLoader 加载
 *
 * ---------------------------------------------------------------------------
 * 转换策略
 * ---------------------------------------------------------------------------
 * 1. 根节点的 'BasicLayout' 映射为 art 的一级布局路由（path: '/'，
 *    component: RoutesAlias.Layout），其 children 平铺为子树。
 * 2. 'RouteView' / 空 component 视为目录，保留 children、component 留空。
 * 3. 'views/xxx' / 'xxx' 普通页面 → 去掉 'views/' 前缀，交给 ComponentLoader
 *    （它会同时去 src/views 与 src/art/views 下查找）。
 * 4. 'plugin/xxx' → 保留 plugin 前缀，ComponentLoader 去 src/plugin 下找。
 * 5. meta 字段透传；hideInMenu / affix 等 art 也认识的字段直接保留。
 * ---------------------------------------------------------------------------
 */
import { RoutesAlias } from '../routesAlias'
import type { AppRouteRecord, RouteMeta } from '#/core/types/router'

interface AdminMenuNode {
  path: string
  component?: string
  name?: string
  meta?: Record<string, any>
  children?: AdminMenuNode[]
  [key: string]: any
}

const LAYOUT_COMPONENTS = new Set(['BasicLayout', 'RouteView'])

/**
 * 把 admin 后端菜单树转为 art 的 AppRouteRecord 树
 */
export function adaptAdminMenusToArtRoutes(
  menus: AdminMenuNode[]
): AppRouteRecord[] {
  return menus.map((node) => adaptNode(node, true))
}

function adaptNode(node: AdminMenuNode, isRoot = false): AppRouteRecord {
  const isLayout = !!node.component && LAYOUT_COMPONENTS.has(node.component)
  const isDirectory = isLayout || !node.component

  // 根级 BasicLayout：映射成 art 的一级布局容器
  if (node.component === 'BasicLayout' && (!node.path || node.path === '/')) {
    return {
      path: '/',
      component: RoutesAlias.Layout,
      name: node.name || '',
      meta: adaptMeta(node.meta, node),
      children: (node.children || []).map((child) => adaptNode(child)),
    }
  }

  // art 路由约定：一级菜单必须指向布局壳 /index/index（由 RouteValidator 强制校验）
  // - 目录型（component 为空 / 是 BasicLayout、RouteView）一级节点直接套壳
  // - 页面型（component 为真实视图，如 views/xxx）一级节点保留 component，
  //   交由 RouteTransformer 自动包裹布局壳并把原页面作为唯一子路由
  const component = isRoot && isDirectory
    ? RoutesAlias.Layout
    : isDirectory
      ? ''
      : normalizeComponent(node.component!)

  const record: AppRouteRecord = {
    path: normalizePath(node.path),
    component,
    name: node.name || '',
    meta: adaptMeta(node.meta, node),
  }

  if (node.children?.length) {
    record.children = node.children.map((child) => adaptNode(child))
  }

  return record
}

/**
 * 组件标识归一化：
 *  - 'views/system/user/index' -> 'system/user/index'
 *  - 'plugin/portal/views/xxx' -> 'plugin/portal/views/xxx'
 *  - 'RouteView' / 'BasicLayout' 不在此处处理（调用方已判断为目录）
 */
function normalizeComponent(component: string): string {
  let c = component.replace(/\.vue$/, '')
  if (c.startsWith('views/')) {
    c = c.slice('views/'.length)
  }
  return c
}

/**
 * 路径归一化：保留后端返回的原始 path（绝对路径）。
 *
 * 【art-admin 改造 · 修复 /system/system/user 双层前缀问题】
 * 原实现去掉前导 '/'，导致 MenuProcessor.normalizeMenuPaths 无法区分
 * 「相对路径」与「被去掉前导的绝对路径」：
 *   - 后端 vben 格式子菜单 path = '/system/user'
 *   - 去掉前导 -> 'system/user'
 *   - buildFullPath('system/user', '/system') -> '/system/system/user' ✗
 * 保留绝对路径后：
 *   - buildFullPath('/system/user', '/system') -> '/system/user' ✓
 *   - RouteTransformer.toRelativePath 再把它转成 'user' 给 vue-router
 *
 * 后端若返回相对路径（如 'user'），buildFullPath 也会正确拼成 '/system/user'。
 */
function normalizePath(path: string): string {
  return path || ''
}

/**
 * meta 适配：把 admin 的 meta 字段映射到 art 认识的字段
 */
function adaptMeta(
  meta: Record<string, any> | undefined,
  node: AdminMenuNode
): RouteMeta {
  const source = meta || {}
  const result: RouteMeta = {
    title: source.title || node.name || '',
  }

  if (source.icon !== undefined) result.icon = source.icon
  if (source.hideInMenu !== undefined) result.hideInMenu = source.hideInMenu
  if (source.affix !== undefined) result.affix = source.affix
  if (source.keepAlive !== undefined) result.keepAlive = source.keepAlive
  if (source.order !== undefined) result.order = source.order
  if (source.frameSrc !== undefined) (result as any).frameSrc = source.frameSrc
  if (source.iframe !== undefined) (result as any).iframe = source.iframe
  if (source.link !== undefined) (result as any).link = source.link

  // 透传 admin 其它 meta（权限码、badge 等），art 不识别的不会影响渲染
  Object.keys(source).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(result, key)) {
      ;(result as any)[key] = source[key]
    }
  })

  return result
}
