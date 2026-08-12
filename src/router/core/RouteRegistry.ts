/**
 * 路由注册核心类
 *
 * 负责动态路由的注册、验证和管理
 *
 * @module router/core/RouteRegistry
 * @author Art Design Pro Team
 */

import type { Router, RouteRecordRaw } from 'vue-router'
import type { AppRouteRecord } from '#/core/types/router'
import { ComponentLoader } from './ComponentLoader'
import { RouteValidator } from './RouteValidator'
import { RouteTransformer } from './RouteTransformer'

export class RouteRegistry {
  private router: Router
  private componentLoader: ComponentLoader
  private validator: RouteValidator
  private transformer: RouteTransformer
  private removeRouteFns: (() => void)[] = []
  private registered = false

  constructor(router: Router) {
    this.router = router
    this.componentLoader = new ComponentLoader()
    this.validator = new RouteValidator()
    this.transformer = new RouteTransformer(this.componentLoader)
  }

  /**
   * 注册动态路由
   *
   * 【art-admin 改造 · 修复 404 catch-all 抢占路由问题】
   * staticRoutes 中注册的 `/:pathMatch(.*)*` (Exception404) 在初始路由表中
   * 排在动态路由前面，导致 Vue Router 在匹配到 /system/xxx 时先命中 404。
   * 解决策略：注册动态路由前先移除已存在的 catch-all/404，注册完成后
   * 再重新把 404 追加到路由表末尾，保证它永远是最后一道匹配防线。
   */
  register(menuList: AppRouteRecord[]): void {
    if (this.registered) {
      console.warn('[RouteRegistry] 路由已注册，跳过重复注册')
      return
    }

    // 验证路由配置
    const validationResult = this.validator.validate(menuList)
    if (!validationResult.valid) {
      throw new Error(`路由配置验证失败: ${validationResult.errors.join(', ')}`)
    }

    // 转换并注册路由
    const removeRouteFns: (() => void)[] = []

    // ---- 404/catch-all 兜底处理：先移除，等动态路由加完再加回末尾 ----
    const CATCH_ALL_NAMES = ['Exception404']
    const savedCatchAllRoutes: RouteRecordRaw[] = []
    const allRoutes = this.router.getRoutes()
    for (const r of allRoutes) {
      if (r.name && CATCH_ALL_NAMES.includes(String(r.name))) {
        // 将其保存后移除，以便在末尾重新插入
        savedCatchAllRoutes.push(r as RouteRecordRaw)
        this.router.removeRoute(r.name)
      }
    }

    menuList.forEach((route) => {
      // 不再要求 route.name 必须存在才注册 —— 后端 BasicLayout 根节点
      // 可能没有 name，导致整个路由树被跳过，页面全部 404。
      // 只在有 name 且已存在时才跳过（避免重复注册）。
      if (route.name && this.router.hasRoute(route.name)) {
        return
      }
      const routeConfig = this.transformer.transform(route)
      // DEBUG: 临时日志，验证 children 是否正确传递
      console.log('[RouteRegistry] addRoute:', routeConfig.path, 'children:', (routeConfig as any).children?.length || 0)
      const removeRouteFn = this.router.addRoute(routeConfig as RouteRecordRaw)
      removeRouteFns.push(removeRouteFn)
    })

    // 将之前移除的 catch-all/404 重新追加到路由表末尾
    for (const catchAll of savedCatchAllRoutes) {
      const removeCatchAllFn = this.router.addRoute(catchAll)
      removeRouteFns.push(removeCatchAllFn)
    }

    this.removeRouteFns = removeRouteFns
    this.registered = true
  }

  /**
   * 移除所有动态路由
   */
  unregister(): void {
    this.removeRouteFns.forEach((fn) => fn())
    this.removeRouteFns = []
    this.registered = false
  }

  /**
   * 检查是否已注册
   */
  isRegistered(): boolean {
    return this.registered
  }

  /**
   * 获取移除函数列表（用于 store 管理）
   */
  getRemoveRouteFns(): (() => void)[] {
    return this.removeRouteFns
  }

  /**
   * 标记为已注册（用于错误处理场景，避免重复请求）
   */
  markAsRegistered(): void {
    this.registered = true
  }
}
