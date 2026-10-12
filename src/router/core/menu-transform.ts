/**
 * madong 后端菜单 → app 容器路由/菜单格式适配层
 *
 * 后端 GET /system/auth/user-menus 返回 vben 风格菜单树
 * （tooling/mock 的 vbenMenus() 复刻自后端 MenuFormattingListener::formatForVben）。
 * app 容器（MenuProcessor / RouteTransformer / 侧边栏）消费 AppRouteRecord，
 * 二者字段命名与结构不同，统一在本模块转换，容器核心代码尽量少改。
 *
 * 主要差异：
 * - 顶层组件 vben 用哨兵 'BasicLayout'，app 容器用 '/index/index'（src/views/index/index.vue）
 * - 子级路径 vben 为全路径（/system/post），容器优先用相对路径；
 *   对于「菜单层级与路径前缀不一致」的节点（如 系统设置 > 网络 > /content/...），
 *   保留绝对路径（vue-router 嵌套记录允许绝对路径，URL 与菜单层级互不影响）
 * - meta：hideInMenu→isHide、hideInTab→isHideTab、affixTab→fixedTab、
 *   authority→roles、badge→showTextBadge、iframeSrc→isIframe+link
 */
import type { AppRouteRecord } from '@/types'
import { requestClient } from '#/api/request'
import { mergePluginMenus } from '@/router/plugin/scanner'

/** mock/后端 vben 菜单节点（仅声明转换用到的字段） */
interface VbenMenuNode {
  id?: number
  path: string
  name: string
  component?: null | string
  redirect?: string
  meta?: Record<string, any>
  badge?: string
  children?: VbenMenuNode[]
  [key: string]: any
}

const LAYOUT_SENTINEL = 'BasicLayout'
const APP_LAYOUT = '/index/index'

/**
 * 后端模式下前端补充的隐藏路由（不在菜单显示，但可通过 URL/程序跳转访问）
 *
 * - Profile：个人中心（对齐 madong-single router/routes/backend.ts）
 * - ConfigCommon：通用配置内嵌页（同上）
 * - UserCenter：容器头部用户菜单 AppUserMenu 跳转入口
 */
const BACKEND_HIDDEN_ROUTES: AppRouteRecord[] = [
  {
    path: '/profile',
    name: 'Profile',
    component: '/_core/profile/index',
    meta: { isHide: true, title: '个人中心' }
  },
  {
    path: '/system/config-common',
    name: 'ConfigCommon',
    component: '/system/config/components/common',
    meta: { isHide: true, title: '通用配置' }
  },
  {
    path: '/system/user-center',
    name: 'UserCenter',
    component: '/system/user-center/index',
    meta: { isHide: true, title: '个人中心' }
  }
]

/** 拉取后端 vben 菜单并转换为 art 菜单树 */
export async function fetchMadongMenuList(): Promise<AppRouteRecord[]> {
  const list = await requestClient.get<VbenMenuNode[]>('/system/auth/user-menus')
  // 开发环境：合并 src/plugin/*/routes.ts 静态菜单（生产以后端返回为准）
  const merged = mergePluginMenus(Array.isArray(list) ? list : [])
  const tree = transformMadongMenus(merged)
  appendHiddenRoutes(tree)
  return tree
}

/** 将前端隐藏路由挂到布局节点下（绝对路径嵌套记录，与后端绝对子页面一致） */
function appendHiddenRoutes(tree: AppRouteRecord[]): void {
  const layout = tree.find((node) => node.component === APP_LAYOUT)
  if (!layout) return
  layout.children = [...(layout.children ?? []), ...BACKEND_HIDDEN_ROUTES]
}

/** vben 菜单树 → art AppRouteRecord 树 */
export function transformMadongMenus(nodes: VbenMenuNode[]): AppRouteRecord[] {
  return nodes.map((node) => convertNode(node, '', true))
}

function toRelativePath(childPath: string, parentPath: string): string {
  if (!childPath.startsWith('/')) return childPath
  // 与父路径同前缀才能安全转相对路径，否则保留绝对路径
  const prefix = parentPath === '/' ? '/' : `${parentPath}/`
  if (childPath === parentPath || childPath.startsWith(prefix)) {
    return childPath.slice(parentPath.length).replace(/^\/+/, '')
  }
  return childPath
}

function convertNode(
  node: VbenMenuNode,
  parentPath: string,
  isTopLevel: boolean
): AppRouteRecord {
  const meta = convertMeta(node)

  // iframe 内嵌页：art 约定 path 为 /outside/iframe/:slug，真实地址放 meta.link
  let path = node.path || ''
  if (meta.isIframe && !path.startsWith('/outside/iframe/')) {
    const slug = encodeURIComponent(
      (node.name || path.replace(/^\/+|\/+$/g, '') || `iframe-${node.id ?? ''}`).replace(
        /[^a-zA-Z0-9_-]/g,
        '-'
      )
    )
    path = `/outside/iframe/${slug}`
  } else if (!isTopLevel && parentPath) {
    path = toRelativePath(path, parentPath)
  }

  const route: AppRouteRecord = {
    path,
    name: node.name,
    meta
  } as AppRouteRecord

  if (node.redirect) {
    route.redirect = node.redirect
  }

  // 组件映射：BasicLayout → art 布局；空组件目录保持 undefined（componentless 父记录）
  if (node.component) {
    route.component =
      isTopLevel && node.component === LAYOUT_SENTINEL
        ? APP_LAYOUT
        : node.component
  }

  const children = node.children?.length
    ? node.children.map((child) => convertNode(child, node.path || '', false))
    : []
  if (children.length) {
    route.children = children
  }

  return route
}

function convertMeta(node: VbenMenuNode): AppRouteRecord['meta'] {
  const src = node.meta ?? {}
  const meta: AppRouteRecord['meta'] = {
    title: src.title ?? node.name ?? '',
    icon: src.icon ?? undefined,
    isHide: Boolean(src.hideInMenu),
    isHideTab: Boolean(src.hideInTab),
    keepAlive: Boolean(src.keepAlive),
    fixedTab: Boolean(src.affixTab)
  }

  if (Array.isArray(src.authority) && src.authority.length) {
    meta.roles = src.authority
  }
  if (src.activePath) {
    meta.activePath = src.activePath
  }
  // 插件归属模块：ComponentLoader 解析插件最简 component 路径时依赖
  if (src.module) {
    meta.module = src.module
  }
  if (node.badge) {
    meta.showTextBadge = node.badge
  }

  // 外链菜单（新窗口打开）
  if (src.link) {
    meta.link = src.link
  }

  // iframe 内嵌：art 以 isIframe + meta.link 驱动 Iframe.vue
  if (src.iframeSrc) {
    meta.isIframe = true
    meta.link = src.iframeSrc
  }

  return meta
}
