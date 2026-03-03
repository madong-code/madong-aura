/**
 * 功能模块路由管理器
 * 
 * 统一管理功能模块路由的扫描和注册
 * 
 * @module router/core/FeatureRouteManager
 * @author Art Design Pro Team
 */

import type { AppRouteRecord } from '@/types/router'
import { AppsModuleScanner } from './AppsModuleScanner'

export class AppsRouteManager {
    private scanner = new AppsModuleScanner()
    private cachedRoutes: AppRouteRecord[] | null = null

    constructor() {
        // 开发环境下添加热更新支持
        if (import.meta.env.DEV && import.meta.hot) {
            this.setupHMR()
        }
    }

    /**
     * 设置热更新支持
     */
    private setupHMR(): void {
        if (import.meta.hot) {
            // 监听路由配置文件变化
            import.meta.hot.on('vite:beforeUpdate', () => {
                // 清空缓存，确保下次获取时重新扫描
                this.clearCache()
            })
        }
    }

    /**
     * 获取所有功能模块路由（懒加载）
     */
    getAppsRoutes(): AppRouteRecord[] {
        if (this.cachedRoutes && !import.meta.env.DEV) {
            return this.cachedRoutes
        }

        console.log('[FeatureRouteManager] 开始扫描功能模块路由...')
        this.cachedRoutes = this.scanner.getAppsRoutes()

        if (this.cachedRoutes.length > 0) {
            console.log(`[FeatureRouteManager] 成功加载 ${this.cachedRoutes.length} 个功能模块路由`)
            this.cachedRoutes.forEach((route, index) => {
                //@ts-ignore
                console.log(`[${index + 1}] ${route?.name || '未命名'} - ${route.path}`)
            })
        } else {
            console.warn('[FeatureRouteManager] 未找到任何功能模块路由')
        }

        return this.cachedRoutes
    }

    /**
     * 清空缓存，强制重新扫描
     */
    clearCache(): void {
        this.cachedRoutes = null
        console.log('[FeatureRouteManager] 缓存已清空')
    }

    /**
     * 检查是否有功能模块路由
     */
    hasFeatureRoutes(): boolean {
        return this.getAppsRoutes().length > 0
    }

    /**
     * 获取功能模块路由统计信息
     */
    getStats(): { total: number; modules: string[] } {
        const routes = this.getAppsRoutes()
        const modules = routes.map(route => route.name?.toString() || route.path || '未知模块')

        return {
            total: routes.length,
            modules
        }
    }

    /**
     * 获取功能模块路由详情
     */
    getRouteDetails(): Array<{ name: string; path: string; children: number }> {
        return this.getAppsRoutes().map(route => ({
            name: route.name?.toString() || '未命名',
            path: route.path || '未定义',
            children: Array.isArray(route.children) ? route.children.length : 0
        }))
    }
}