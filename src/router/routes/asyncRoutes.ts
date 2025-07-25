import { AppRouteRecord } from '@/types/router'

/**
 * 菜单列表、异步路由
 *
 * 支持两种模式:
 * 前端静态配置 - 直接使用本文件中定义的路由配置
 * 后端动态配置 - 后端返回菜单数据，前端解析生成路由
 *
 * 菜单标题（title）:
 * 可以是 i18n 的 key，也可以是字符串，比如：'用户列表'
 *
 * RoutesAlias.Layout 指向的是布局组件，后端返回的菜单数据中，component 字段需要指向 /index/index
 * 路由元数据（meta）：异步路由在 asyncRoutes 中配置，静态路由在 staticRoutes 中配置
 */
// 定义模块类型
interface RouteModuleType {
  default: AppRouteRecord[]
}
const dynamicRouteFiles = import.meta.glob('./modules/**/*.ts', {
  eager: true
})
const ignoreFiles = ['examples'] // 可以扩展为多个需要忽略的关键词
const mergedRoutes: AppRouteRecord[] = []
Object.keys(dynamicRouteFiles)
  .filter((key) => {
    return !ignoreFiles.some((ignore) => key.includes(ignore))
  })
  .forEach((key) => {
    const routeModule = dynamicRouteFiles[key] as RouteModuleType
    const moduleRoutes = routeModule?.default ?? []
    mergedRoutes.push(...moduleRoutes)
  })
// 添加排序逻辑
const sortedRoutes = mergedRoutes.sort((a, b) => {
  const orderA = a.meta?.order ?? 9999
  const orderB = b.meta?.order ?? 9999
  return orderA - orderB
})
export const asyncRoutes: AppRouteRecord[] = [...sortedRoutes]
