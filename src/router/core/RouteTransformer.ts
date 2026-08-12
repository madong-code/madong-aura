/**
 * 路由转换器
 *
 * 负责将菜单数据转换为 Vue Router 路由配置
 *
 * @module router/core/RouteTransformer
 * @author Art Design Pro Team
 */

import type { RouteRecordRaw } from 'vue-router'
import type { AppRouteRecord } from '#/core/types/router'
import { ComponentLoader } from './ComponentLoader'
import { IframeRouteManager } from './IframeRouteManager'

interface ConvertedRoute extends Omit<RouteRecordRaw, 'children'> {
  id?: number
  children?: ConvertedRoute[]
  component?: RouteRecordRaw['component'] | (() => Promise<any>)
}

export class RouteTransformer {
  private componentLoader: ComponentLoader
  private iframeManager: IframeRouteManager

  constructor(componentLoader: ComponentLoader) {
    this.componentLoader = componentLoader
    this.iframeManager = IframeRouteManager.getInstance()
  }

  /**
   * 转换路由配置
   *
   * 【art-admin 改造 · 对齐 vben 套壳】
   * 原生 art 的 isFirstLevelRoute 只处理「无 children 的一级叶子菜单」，
   * 对「目录型一级菜单」（如 /system 含子页面）返回 false，导致：
   *   - /system 直接渲染 AppLayout 但没有 children；
   *   - 子路由 /system/user 被注册成顶层绝对路由，不在 /system 的嵌套下；
   *   - AppLayout 内部的 <RouterView> 永远找不到匹配子路由 → 404 / 空白。
   *
   * 修复：让所有 depth===0 的一级路由都套 AppLayout 壳，并把子路由递归
   * 转换为嵌套 children（子路由 path 取相对段，避免 vue-router 重复拼前缀）。
   */
  transform(route: AppRouteRecord, depth = 0): ConvertedRoute {
    const { component, children, ...routeConfig } = route

    // 基础路由配置
    const converted: ConvertedRoute = {
      ...routeConfig,
      component: undefined
    }

    // 处理不同类型的路由
    if (route.meta.isIframe) {
      this.handleIframeRoute(converted, route, depth)
    } else if (depth === 0) {
      // 一级路由统一套 AppLayout 壳（无论有无 children）
      this.handleFirstLevelRoute(converted, route, component as string, children)
    } else {
      this.handleNormalRoute(converted, component as string)
    }

    // 递归处理子路由（嵌套进父壳的 children，path 取相对段）
    if (children?.length && !converted.children) {
      converted.children = children.map((child) =>
        this.transform(child, depth + 1)
      )
    }

    // 目录型路由兜底：有 children 但无 component 时，使用 RouterView 作为容器。
    // 对齐 admin 的 generateRoutesByBackend：
    //   if (!component && route.children && route.children.length > 0)
    //     route.component = layoutMap.RouteView;
    // 缺少这一步，vue-router 渲染链会在目录节点断裂，子路由无法挂载 → 404。
    if (!converted.component && converted.children && converted.children.length > 0) {
      converted.component = this.componentLoader.loadRouteView()
    }

    return converted
  }

  /**
   * 处理 iframe 类型路由
   */
  private handleIframeRoute(
    targetRoute: ConvertedRoute,
    sourceRoute: AppRouteRecord,
    depth: number
  ): void {
    if (depth === 0) {
      // 顶级 iframe：用 Layout 包裹
      targetRoute.component = this.componentLoader.loadLayout()
      targetRoute.path = this.extractFirstSegment(sourceRoute.path || '')
      targetRoute.name = ''

      targetRoute.children = [
        {
          ...sourceRoute,
          component: this.componentLoader.loadIframe()
        } as ConvertedRoute
      ]
    } else {
      // 非顶级（嵌套）iframe：直接使用 Iframe.vue
      targetRoute.component = this.componentLoader.loadIframe()
    }

    // 记录 iframe 路由
    this.iframeManager.add(sourceRoute)
  }

  /**
   * 处理一级菜单路由（套 AppLayout 壳）
   *
   * @param children 原始子路由（用于嵌套转换）。若有 children 则递归转换后
   *                 挂到壳的 children 上；否则把当前 route 自身作为唯一子路由。
   */
  private handleFirstLevelRoute(
    converted: ConvertedRoute,
    route: AppRouteRecord,
    component: string | undefined,
    children?: AppRouteRecord[]
  ): void {
    converted.component = this.componentLoader.loadLayout()
    converted.path = this.extractFirstSegment(route.path || '')
    converted.name = ''
    route.meta.isFirstLevel = true

    if (children?.length) {
      // 目录型一级菜单：子路由嵌套进壳，保持后端原始 path（绝对路径）。
      // vue-router 对子路由 path 以 '/' 开头时视为绝对路径，不拼接到父路径，
      // 菜单 path 与路由 path 自然保持一致。对齐 admin 的 mapTree 策略。
      converted.children = children.map((child) =>
        this.transform(child, 1)
      )
    } else {
      // 叶子型一级菜单：自身作为壳内唯一子路由
      converted.children = [
        {
          ...route,
          // 子路由 path 用相对段，避免与父壳 path 重复拼接
          path: this.stripFirstSegment(route.path || ''),
          component: component ? this.componentLoader.load(component) : undefined
        } as ConvertedRoute
      ]
    }
  }

  /**
   * 把子路由的 path 转为相对父壳的相对路径
   * 例：父 '/system'，子 '/system/user' -> 'user'
   */
  private toRelativePath(child: AppRouteRecord, parentPath: string): AppRouteRecord {
    if (!parentPath || parentPath === '/') return child
    const rel = child.path?.replace(parentPath, '') ?? child.path
    return {
      ...child,
      path: rel.replace(/^\//, '') || child.path,
    }
  }

  /**
   * 去掉 path 的第一段（用于叶子一级菜单的子路由 path）
   * 例：'/system/user' -> 'system/user' 已是相对，'/dashboard' -> 'dashboard'
   */
  private stripFirstSegment(path: string): string {
    return path.replace(/^\//, '')
  }

  /**
   * 处理普通路由
   */
  private handleNormalRoute(converted: ConvertedRoute, component: string | undefined): void {
    if (component) {
      converted.component = this.componentLoader.load(component)
    }
  }

  /**
   * 提取路径的第一段
   */
  private extractFirstSegment(path: string): string {
    const segments = path.split('/').filter(Boolean)
    return segments.length > 0 ? `/${segments[0]}` : '/'
  }
}
