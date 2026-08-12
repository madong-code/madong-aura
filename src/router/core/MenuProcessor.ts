/**
 * 菜单处理器
 *
 * 负责菜单数据的获取、过滤和处理
 *
 * @module router/core/MenuProcessor
 * @author Art Design Pro Team
 */

import type { AppRouteRecord } from '#/core/types/router'
import { useUserStore } from '#/core/stores/modules/user'
import { useAppMode } from '#/core/composables/art/useAppMode'
import { asyncRoutes } from '../routes/asyncRoutes'
import { RoutesAlias } from '../routesAlias'
import { formatMenuTitle } from '#/core/shared/art-utils'
import { getAllMenusApi } from '#/api/core/menu'
import { adaptAdminMenusToArtRoutes } from './adminMenuAdapter'

export class MenuProcessor {
  /**
   * 获取菜单数据
   */
  async getMenuList(): Promise<AppRouteRecord[]> {
    const { isFrontendMode } = useAppMode()

    let menuList: AppRouteRecord[]
    if (isFrontendMode.value) {
      menuList = await this.processFrontendMenu()
    } else {
      menuList = await this.processBackendMenu()
    }

    // 在规范化路径之前，验证原始路径配置
    this.validateMenuPaths(menuList)

    // 规范化路径（将相对路径转换为完整路径）
    return this.normalizeMenuPaths(menuList)
  }

  /**
   * 处理前端控制模式的菜单
   */
  private async processFrontendMenu(): Promise<AppRouteRecord[]> {
    const userStore = useUserStore()
    const roles = userStore.info?.roles

    let menuList = [...asyncRoutes]

    // 根据角色过滤菜单
    if (roles && roles.length > 0) {
      menuList = this.filterMenuByRoles(menuList, roles)
    }

    return this.filterEmptyMenus(menuList)
  }

  /**
   * 处理后端控制模式的菜单
   *
   * 【art-admin 改造】改为调用 admin 后端的 `/system/auth/user-menus`
   * （RouteRecordStringComponent 格式），再经 adminMenuAdapter 转成
   * art 的 AppRouteRecord，从而复用 admin 的全部菜单/插件路由/权限结构。
   */
  private async processBackendMenu(): Promise<AppRouteRecord[]> {
    const adminMenus = await getAllMenusApi()
    const artRoutes = adaptAdminMenusToArtRoutes(adminMenus)
    return this.filterEmptyMenus(artRoutes)
  }

  /**
   * 根据角色过滤菜单
   */
  private filterMenuByRoles(menu: AppRouteRecord[], roles: string[]): AppRouteRecord[] {
    return menu.reduce((acc: AppRouteRecord[], item) => {
      const itemRoles = item.meta?.roles
      const hasPermission = !itemRoles || itemRoles.some((role) => roles?.includes(role))

      if (hasPermission) {
        const filteredItem = { ...item }
        if (filteredItem.children?.length) {
          filteredItem.children = this.filterMenuByRoles(filteredItem.children, roles)
        }
        acc.push(filteredItem)
      }

      return acc
    }, [])
  }

  /**
   * 递归过滤空菜单项
   */
  private filterEmptyMenus(menuList: AppRouteRecord[]): AppRouteRecord[] {
    return menuList
      .map((item) => {
        // 如果有子菜单，先递归过滤子菜单
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterEmptyMenus(item.children)
          return {
            ...item,
            children: filteredChildren
          }
        }
        return item
      })
      .filter((item) => {
        // 如果定义了 children 属性（即使是空数组），说明这是一个目录菜单，应该保留
        if ('children' in item) {
          return true
        }

        // 如果有外链或 iframe，保留
        if (item.meta?.isIframe === true || item.meta?.link) {
          return true
        }

        // 如果有有效的 component，保留
        if (item.component && item.component !== '' && item.component !== RoutesAlias.Layout) {
          return true
        }

        // 其他情况过滤掉
        return false
      })
  }

  /**
   * 验证菜单列表是否有效
   */
  validateMenuList(menuList: AppRouteRecord[]): boolean {
    return Array.isArray(menuList) && menuList.length > 0
  }

  /**
   * 规范化菜单路径
   * 将相对路径转换为完整路径，确保菜单跳转正确
   */
  private normalizeMenuPaths(menuList: AppRouteRecord[], parentPath = ''): AppRouteRecord[] {
    return menuList.map((item) => {
      // 构建完整路径
      const fullPath = this.buildFullPath(item.path || '', parentPath)

      // 递归处理子菜单
      const children = item.children?.length
        ? this.normalizeMenuPaths(item.children, fullPath)
        : item.children

      const redirect = item.redirect || this.resolveDefaultRedirect(children)

      return {
        ...item,
        path: fullPath,
        redirect,
        children
      }
    })
  }

  /**
   * 为目录型菜单推导默认跳转地址
   */
  private resolveDefaultRedirect(children?: AppRouteRecord[]): string | undefined {
    if (!children?.length) {
      return undefined
    }

    for (const child of children) {
      if (this.isNavigableRoute(child)) {
        return child.path
      }

      const nestedRedirect = this.resolveDefaultRedirect(child.children)
      if (nestedRedirect) {
        return nestedRedirect
      }
    }

    return undefined
  }

  /**
   * 判断子路由是否可以作为默认落点
   */
  private isNavigableRoute(route: AppRouteRecord): boolean {
    return Boolean(
      route.path &&
        route.path !== '/' &&
        !route.meta?.link &&
        route.meta?.isIframe !== true &&
        route.component &&
        route.component !== ''
    )
  }

  /**
   * 验证菜单路径配置
   *
   * 【art-admin 改造 · 对齐 admin 路径策略】
   * 后端返回的 path 已是完整的路由路径（绝对路径），参考 admin 的
   * generateRoutesByBackend：不修改 path，只转换 component。
   * 因此不再对二级及以下菜单的绝对路径报错。
   */
  private validateMenuPaths(menuList: AppRouteRecord[], level = 1): void {
    // 对齐 admin：后端 path 即最终路由 path，无需校验 / 开头
    // 仅递归检查是否有其他配置问题（保留方法以便后续扩展）
    menuList.forEach((route) => {
      if (!route.children?.length) return
      this.validateMenuPaths(route.children, level + 1)
    })
  }

  /**
   * 判断是否为合法的绝对路径
   */
  private isValidAbsolutePath(path: string): boolean {
    return (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('/outside/iframe/')
    )
  }

  /**
   * 输出路径配置错误日志（已停用，保留以防外部调用）
   */
  private logPathError(
    route: AppRouteRecord,
    path: string,
    parentName: string,
    level: number
  ): void {
    const routeName = String(route.name || path || '未知路由')
    const menuTitle = route.meta?.title || routeName
    const suggestedPath = path.split('/').pop() || path.slice(1)

    console.error(
      `[路由配置错误] 菜单 "${formatMenuTitle(menuTitle)}" (name: ${routeName}, path: ${path}) 配置错误\n` +
        `  位置: ${parentName} > ${routeName}\n` +
        `  问题: ${level + 1}级菜单的 path 不能以 / 开头\n` +
        `  当前配置: path: '${path}'\n` +
        `  应该改为: path: '${suggestedPath}'`
    )
  }

  /**
   * 构建完整路径
   *
   * 【art-admin 改造 · 对齐 admin 路由路径策略】
   * 后端返回的 path 已是完整的路由路径（绝对路径），参考 admin 的
   * generateRoutesByBackend：只转换 component，不修改 path。
   *
   * vue-router 嵌套路由对子路由 path 以 '/' 开头时视为绝对路径，
   * 不会拼接到父路径，因此菜单 path 与路由 path 自然保持一致。
   */
  private buildFullPath(path: string, parentPath: string): string {
    if (!path) return ''

    // 外部链接直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // 绝对路径直接返回（对齐 admin：后端 path 即最终路由 path）
    if (path.startsWith('/')) {
      return path
    }

    // 相对路径，拼接到父路径
    if (parentPath) {
      const cleanParent = parentPath.replace(/\/$/, '')
      const cleanChild = path.replace(/^\//, '')
      return `${cleanParent}/${cleanChild}`
    }

    // 没有父路径，添加前导斜杠
    return `/${path}`
  }
}
