/**
 * 插件静态路由扫描器
 *
 * 扫描 src/plugin 下各插件的 routes.ts（或 routes/index.ts）导出的 vben 后端
 * 格式菜单节点，在开发环境下合并到后端返回的菜单树，便于本地开发插件时无需
 * 后端配置菜单。生产环境始终以后端返回的菜单为权威来源，不扫描、不合并
 * （与 madong-single PluginRouteScanner 的 isPluginStaticEnabled 策略一致）。
 *
 * 节点 component 均为字符串，支持 BasicLayout 哨兵与插件页面路径写法，
 * 最终统一由 ComponentLoader 解析；具体写法见 src/plugin/demo/routes.ts。
 */
interface PluginMenuNode {
  children?: PluginMenuNode[]
  component?: null | string
  meta?: Record<string, any>
  name: string
  path: string
  [key: string]: any
}

/** 扫描所有插件的 routes 文件（eager：路由表必须在首屏导航前就绪） */
const routeModules = import.meta.glob<PluginMenuNode[] | { default?: PluginMenuNode[]; routes?: PluginMenuNode[] }>(
  '../../plugin/**/routes{.ts,/index.ts}',
  { eager: true }
)

function extractRoutes(mod: PluginMenuNode[] | { default?: PluginMenuNode[]; routes?: PluginMenuNode[] }): PluginMenuNode[] {
  if (Array.isArray(mod)) return mod
  if (Array.isArray(mod.default)) return mod.default
  if (Array.isArray(mod.routes)) return mod.routes
  return []
}

/** 布局哨兵节点不注入 module，避免其布局组件路径（/index/index）被误判为插件页面 */
const LAYOUT_COMPONENTS = new Set(['BasicLayout', 'RouteView'])

/** 递归为页面节点注入 meta.module（插件内最简 component 路径依赖） */
function injectModule(nodes: PluginMenuNode[], pluginName: string, parentModule?: string): void {
  for (const node of nodes) {
    node.meta = node.meta ?? {}
    const isLayout = node.component != null && LAYOUT_COMPONENTS.has(node.component)
    const inheritedModule = isLayout ? undefined : parentModule ?? pluginName
    if (!isLayout && !node.meta.module) {
      node.meta.module = inheritedModule
    }
    if (node.children?.length) {
      // 布局节点本身不持有 module，但子页面仍需按当前插件名注入
      injectModule(node.children, pluginName, isLayout ? undefined : node.meta.module)
    }
  }
}

/** 扫描并返回全部插件菜单节点（仅开发环境有值） */
export function scanPluginMenus(): PluginMenuNode[] {
  if (!import.meta.env.DEV) return []

  const result: PluginMenuNode[] = []
  for (const [filePath, mod] of Object.entries(routeModules)) {
    try {
      const pluginName = filePath.replace('../../plugin/', '').split('/')[0]
      if (!pluginName) continue

      const routes = extractRoutes(mod)
      if (routes.length === 0) {
        console.warn(`[PluginScanner] 插件 ${pluginName} 未定义路由`)
        continue
      }

      injectModule(routes, pluginName)
      result.push(...routes)
      console.info(`[PluginScanner] 插件 ${pluginName} 扫描完成：${routes.length} 个顶层路由`)
    } catch (error) {
      // 错误隔离：单个插件失败不影响其他插件与框架菜单
      console.error(`[PluginScanner] 插件路由扫描失败：${filePath}`, error)
    }
  }
  return result
}

function findNode(nodes: PluginMenuNode[], name: string): PluginMenuNode | undefined {
  for (const node of nodes) {
    if (node.name === name) return node
    if (node.children?.length) {
      const found = findNode(node.children, name)
      if (found) return found
    }
  }
  return undefined
}

/** 同名字段合并：插件补充覆盖后端，meta 做对象级合并避免丢字段 */
function mergeNode(existing: PluginMenuNode, extra: PluginMenuNode): void {
  const extraMeta = extra.meta
  const extraChildren = extra.children
  Object.assign(existing, extra)
  if (extraMeta) {
    existing.meta = { ...(existing.meta ?? {}), ...extraMeta }
  }
  // children 在调用方递归处理，这里还原引用避免自合并
  if (extraChildren) {
    existing.children = extraChildren
  }
}

/**
 * 将插件节点合并进后端菜单树：
 * - 同名节点：后端节点为基底，插件字段补充覆盖，children 按 name 递归合并
 * - 插件独有节点：追加到根（未显式配 sort 的排最后）
 */
export function mergePluginMenus(backendMenus: PluginMenuNode[]): PluginMenuNode[] {
  const pluginMenus = scanPluginMenus()
  if (pluginMenus.length === 0) return backendMenus

  // 菜单节点为纯 JSON（requestClient 返回），深拷贝避免污染原始数据
  const merged: PluginMenuNode[] = JSON.parse(JSON.stringify(backendMenus))

  const mergeChildren = (backendChildren: PluginMenuNode[], extraChildren: PluginMenuNode[]): PluginMenuNode[] => {
    const list = [...backendChildren]
    for (const extra of extraChildren) {
      const existing = list.find((item) => item.name === extra.name)
      if (existing) {
        mergeNode(existing, extra)
        if (extra.children?.length) {
          existing.children = mergeChildren(existing.children ?? [], extra.children)
        }
      } else {
        list.push(extra)
      }
    }
    return list
  }

  for (const pluginNode of pluginMenus) {
    const existing = findNode(merged, pluginNode.name)
    if (existing) {
      mergeNode(existing, pluginNode)
      if (pluginNode.children?.length) {
        existing.children = mergeChildren(existing.children ?? [], pluginNode.children)
      }
    } else {
      merged.push(pluginNode)
    }
  }

  return merged
}
