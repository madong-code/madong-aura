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
 * 注意事项：
 * 1、RoutesAlias.Layout 指向的是布局容器，后端返回的菜单数据中，component 字段需要指向 /index/index
 * 2、path、name 不要和动态路由冲突，否则会导致路由冲突无法访问
 */

// 1. 定义类型：适配模块的不同导出方式
type RouteModule =
  | { default: AppRouteRecord[] } // 默认导出路由数组
  | { routes: AppRouteRecord[] } // 命名导出路由数组

// 2. 递归匹配 modules 目录下所有 .ts 文件（兼容子目录）
const modules: Record<string, RouteModule> = import.meta.glob('./modules/**/*.ts', { eager: true })

// 3. 排除特定子目录下的路由模块
const IGNORE_MODULES: any = ['localRoutes'] // 忽略的文件名
const IGNORE_SUBDIRS: any = [] // 忽略的子目录名数组

const filteredKeys = Object.keys(modules).filter((key) => {
  // 提取完整文件名（不含扩展名）
  const fileName = key.split('/').pop()?.split('.')[0] || ''

  // 检查是否在忽略文件名列表中
  if (IGNORE_MODULES.includes(fileName)) {
    return false
  }

  // 检查路径是否包含忽略的子目录
  const isIgnoredSubdir = IGNORE_SUBDIRS.some(
    (subdir: any) => key.includes(`/${subdir}/`) // 确保匹配完整目录名
  )

  return !isIgnoredSubdir
})

// 4. 收集路由
const moduleRoutes: AppRouteRecord[] = []
filteredKeys.forEach((key) => {
  const mod = modules[key]
  // 兼容默认导出或命名导出
  const routes = 'default' in mod ? mod.default : mod.routes
  moduleRoutes.push(...(routes ?? [])) // 确保推入的是数组
})

// 按 meta.order 正序排序
moduleRoutes.sort((a, b) => {
  const orderA = a.meta?.order ?? 9999
  const orderB = b.meta?.order ?? 9999
  return orderA - orderB
})
export const asyncRoutes: AppRouteRecord[] = [...moduleRoutes]
