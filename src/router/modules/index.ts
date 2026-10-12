import type { AppRouteRecord } from '@/types'

/**
 * 前端模式（VITE_ACCESS_MODE=frontend）下本地维护的动态路由。
 * 项目主体使用后端模式，菜单由 madong 接口 GET /system/auth/user-menus 返回；
 * 如前端模式需要内置菜单，在此数组中追加路由配置。
 */
export const routeModules: AppRouteRecord[] = []
