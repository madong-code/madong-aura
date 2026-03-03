/**
 * 动态路由处理
 * 根据接口返回的菜单列表注册动态路由
 */
import type { Router, RouteRecordRaw } from 'vue-router'
import type { AppRouteRecord } from '@/types/router'
import { saveIframeRoutes } from './menuToRouter'
import { RoutesAlias } from '../routesAlias'
import { h } from 'vue'
import { useMenuStore } from '@/store/modules/menu'

/**
 * 动态导入 app/views 目录下所有 .vue 组件
 */
const appModules: Record<string, () => Promise<any>> = import.meta.glob('@/app/views/**/*.vue', { eager: false })

/**
 * 动态导入 features 模块下所有 .vue 组件
 */
const featuresModules: Record<string, () => Promise<any>> = import.meta.glob('@/features/**/views/**/*.vue', { eager: false })

/**
 * 注册异步路由
 * 将接口返回的菜单列表转换为 Vue Router 路由配置，并添加到传入的 router 实例中
 * @param router Vue Router 实例
 * @param menuList 接口返回的菜单列表
 */
export function registerDynamicRoutes(router: Router, menuList: AppRouteRecord[]): void {
  // 用于局部收集 iframe 类型路由
  const iframeRoutes: AppRouteRecord[] = []
  // 收集路由移除函数
  const removeRouteFns: (() => void)[] = []

  // 检测菜单列表中是否有重复路由
  checkDuplicateRoutes(menuList)

  // 遍历菜单列表，注册路由
  menuList.forEach((route) => {
    // 只有还没注册过的路由才进行注册
    if (route.name && !router.hasRoute(route.name)) {
      const routeConfig = convertRouteComponent(route, iframeRoutes)
      // addRoute 返回移除函数，收集起来
      const removeRouteFn = router.addRoute(routeConfig as RouteRecordRaw)
      removeRouteFns.push(removeRouteFn)
    }
  })

  // 将移除函数存储到 store 中
  const menuStore = useMenuStore()
  menuStore.addRemoveRouteFns(removeRouteFns)

  // 保存 iframe 路由
  saveIframeRoutes(iframeRoutes)
}

/**
 * 路径解析函数：处理父路径和子路径的拼接
 */
function resolvePath(parent: string, child: string): string {
  return [parent.replace(/\/$/, ''), child.replace(/^\//, '')].filter(Boolean).join('/')
}

/**
 * 检测菜单中的重复路由（包括子路由）
 */
function checkDuplicateRoutes(routes: AppRouteRecord[], parentPath = ''): void {
  // 用于检测动态路由中的重复项
  const routeNameMap = new Map<string, string>() // 路由名称 -> 路径
  const componentPathMap = new Map<string, string>() // 组件路径 -> 路由信息

  const checkRoutes = (routes: AppRouteRecord[], parentPath = '') => {
    routes.forEach((route) => {
      // 处理路径拼接
      const currentPath = route.path || ''
      const fullPath = resolvePath(parentPath, currentPath)

      // 名称重复检测
      if (route.name) {
        if (routeNameMap.has(String(route.name))) {
          console.warn(`[路由警告] 名称重复: "${String(route.name)}"`)
        } else {
          routeNameMap.set(String(route.name), fullPath)
        }
      }

      // 组件路径重复检测
      if (route.component) {
        const componentPath = getComponentPathString(route.component)

        if (componentPath && componentPath !== RoutesAlias.Layout) {
          const componentKey = `${parentPath}:${componentPath}`

          if (componentPathMap.has(componentKey)) {
            console.warn(`[路由警告] 路径重复: "${componentPath}"`)
          } else {
            componentPathMap.set(componentKey, fullPath)
          }
        }
      }

      // 递归处理子路由
      if (route.children?.length) {
        checkRoutes(route.children, fullPath)
      }
    })
  }

  checkRoutes(routes, parentPath)
}

/**
 * 获取组件路径的字符串表示
 */
function getComponentPathString(component: any): string {
  if (typeof component === 'string') {
    return component
  }

  // 对于其他别名路由，获取组件名称
  for (const key in RoutesAlias) {
    if (RoutesAlias[key as keyof typeof RoutesAlias] === component) {
      return `RoutesAlias.${key}`
    }
  }

  return ''
}

/**
 * 从 meta 中获取模块名
 */
function getModuleNameFromMeta(meta: any): string | null {
  // 支持多种字段名：module、feature、featuresModule
  return meta?.module || meta?.feature || meta?.featuresModule || null
}

/**
 * 验证组件路径格式
 */
function validateComponentPath(componentPath: string): boolean {
  if (!componentPath) return false
  // 检查路径是否以斜杠开头
  if (!componentPath.startsWith('/')) {
    console.warn(`[路由警告] 组件路径应该以斜杠开头: ${componentPath}`)
    return false
  }
  return true
}

/**
 * 根据组件路径和模块信息动态加载组件
 * @param componentPath 组件路径（不包含前缀和 .vue 后缀）
 * @param routeName 当前路由名称（用于错误提示）
 * @param meta 路由元数据（包含模块信息）
 * @returns 组件加载函数
 */
function loadComponent(componentPath: string, routeName: string, meta: any): () => Promise<any> {
  // 如果路径为空，直接返回一个空的组件
  if (componentPath === '') {
    return () =>
      Promise.resolve({
        render() {
          return h('div', {})
        }
      })
  }



  // 验证组件路径格式
  if (!validateComponentPath(componentPath)) {
    console.warn(`[路由警告] 组件路径格式不正确: ${routeName} - ${componentPath}`)
  }

  // 从 meta 中获取模块名
  const moduleName = getModuleNameFromMeta(meta)

  // 如果有模块名且不是 app，从模块的 views 目录加载
  if (moduleName && moduleName !== 'app') {
    return loadFeaturesComponent(componentPath, moduleName, routeName)
  }

  // 默认从 app/views 目录加载
  return loadAppComponent(componentPath, routeName)
}

/**
 * 从 app/views 目录加载组件
 */
function loadAppComponent(componentPath: string, routeName: string): () => Promise<any> {
  // 构建可能的路径
  const fullPath = `@/app/views${componentPath}.vue`
  const fullPathWithIndex = `@/app/views${componentPath}/index.vue`

  // 先尝试直接路径，再尝试添加/index的路径
  const module = appModules[fullPath] || appModules[fullPathWithIndex]

  if (!module) {
    console.error(
      `[路由错误] 未找到组件：${routeName}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
    )
    return () =>
      Promise.resolve({
        render() {
          return h('div', `组件未找到: ${routeName}`)
        }
      })
  }

  return module
}

/**
 * 从 features 模块的 views 目录加载组件
 */
function loadFeaturesComponent(componentPath: string, moduleName: string, routeName: string): () => Promise<any> {
  // 验证模块名格式
  if (!moduleName || typeof moduleName !== 'string') {
    console.error(`[路由错误] 模块名格式不正确: ${moduleName}，路由: ${routeName}`)
    return loadAppComponent(componentPath, routeName)
  }

  // 构建可能的路径
  const fullPath = `@/features/${moduleName}/views${componentPath}.vue`
  const fullPathWithIndex = `@/features/${moduleName}/views${componentPath}/index.vue`

  console.log(`[路由调试] 尝试加载模块 ${moduleName} 的组件：${routeName}，路径: ${fullPath} 和 ${fullPathWithIndex}`)

  // 先尝试直接路径，再尝试添加/index的路径
  const module = featuresModules[fullPath] || featuresModules[fullPathWithIndex]

  if (!module) {
    console.error(
      `[路由错误] 未找到模块 ${moduleName} 的组件：${routeName}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
    )
    // 如果模块中找不到，尝试从 app/views 目录加载
    return loadAppComponent(componentPath, routeName)
  }

  console.log(`[路由调试] 成功加载模块 ${moduleName} 的组件：${routeName}`)
  return module
}

/**
 * 转换后的路由配置类型
 */
interface ConvertedRoute extends Omit<RouteRecordRaw, 'children'> {
  id?: number
  children?: ConvertedRoute[]
  component?: RouteRecordRaw['component'] | (() => Promise<any>)
}

/**
 * 转换路由组件配置
 */
function convertRouteComponent(
  route: AppRouteRecord,
  iframeRoutes: AppRouteRecord[],
  depth = 0
): ConvertedRoute {
  const { component, children, ...routeConfig } = route

  // 基础路由配置
  const converted: ConvertedRoute = {
    ...routeConfig,
    component: undefined
  }

  // 是否为一级菜单
  const isFirstLevel =
    depth === 0 && route.children?.length === 0 && component !== RoutesAlias.Layout

  if (route.meta.isIframe) {
    handleIframeRoute(converted, route, iframeRoutes, depth)
  } else if (isFirstLevel) {
    handleLayoutRoute(converted, route, component as string)
  } else {
    handleNormalRoute(converted, component as string, String(route.name), route.meta)
  }

  // 递归时增加深度
  if (children?.length) {
    converted.children = children.map((child) =>
      convertRouteComponent(child, iframeRoutes, depth + 1)
    )
  }

  return converted
}

/**
 * 处理 iframe 类型路由
 */
function handleIframeRoute(
  targetRoute: ConvertedRoute,
  sourceRoute: AppRouteRecord,
  iframeRoutes: AppRouteRecord[],
  depth: number
): void {
  const LAYOUT_VIEW = () => import('@/layout/index.vue')
  const IFRAME_VIEW = () => import('@/layout/outside/index.vue')


  if (depth === 0) {
    // 顶级 iframe：用 Layout 包裹
    targetRoute.component = LAYOUT_VIEW
    targetRoute.path = `/${(sourceRoute.path?.split('/')[1] || '').trim()}`
    // 移除父路由的 name，避免与子路由冲突
    targetRoute.name = undefined

    targetRoute.children = [
      {
        ...sourceRoute,
        component: IFRAME_VIEW
      } as ConvertedRoute
    ]
  } else {
    // 非顶级（嵌套）iframe：直接使用 Iframe.vue
    targetRoute.component = IFRAME_VIEW
  }

  // 记录 iframe 路由，供 Iframe.vue 查找对应的外链
  iframeRoutes.push(sourceRoute)
}

/**
 * 处理一级菜单路由
 */
function handleLayoutRoute(
  converted: ConvertedRoute,
  route: AppRouteRecord,
  component: string | undefined
): void {
  converted.component = () => import('@/app/views/layout/index.vue')
  converted.path = `/${(route.path?.split('/')[1] || '').trim()}`
  // 移除父路由的 name，避免与子路由冲突
  converted.name = undefined
  route.meta.isFirstLevel = true

  converted.children = [
    {
      ...route,
      component: loadComponent(component as string, String(route.name), route.meta)
    } as ConvertedRoute
  ]
}

/**
 * 处理普通路由
 */
function handleNormalRoute(
  converted: ConvertedRoute,
  component: string | undefined,
  routeName: string,
  meta: any
): void {
  if (component) {
    const aliasComponent = RoutesAlias[
      component as keyof typeof RoutesAlias
    ] as unknown as RouteRecordRaw['component']
    converted.component = aliasComponent || loadComponent(component as string, routeName, meta)
  }
}