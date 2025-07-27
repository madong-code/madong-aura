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
 * 一级父级菜单 RoutesAlias.Layout 指向的是布局容器，后端返回的菜单数据中，component 字段需要指向 /index/index
 * 路由元数据（meta）：异步路由在 asyncRoutes 中配置，静态路由在 staticRoutes 中配置
 */
type RouteModuleType = {
  default: AppRouteRecord[]
}
const INGORE_MODULES = ['examples']
const modules: any = import.meta.glob('./modules/**/**.ts', { eager: true })
const moduleRuotes: AppRouteRecord[] = []
Object.keys(modules)
  .filter((key) => {
    return !INGORE_MODULES.some((item) => {
      return key.includes(item)
    })
  })
  .forEach((key) => {
    const mod = modules[key] as RouteModuleType
    const modList = mod.default ?? []
    moduleRuotes.push(...modList)
  })
// 按 meta.order 正序排序
moduleRuotes.sort((a, b) => {
  const orderA = a.meta?.order ?? 9999
  const orderB = b.meta?.order ?? 9999
  return orderA - orderB
})
export const asyncRoutes: AppRouteRecord[] = [...moduleRuotes]
