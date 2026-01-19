/**
 * 功能模块扫描器
 * 
 * 自动扫描 features 目录下的功能模块并生成路由配置
 * 支持默认导出模式
 * 
 * @module router/core/FeatureModuleScanner
 * @author Art Design Pro Team
 */

import type { AppRouteRecord } from '@/types/router'
import { RouteValidator } from './RouteValidator'

export class FeatureModuleScanner {
    private validator = new RouteValidator()

    /**
     * 扫描 features 目录并生成路由配置
     */
    scanFeatures(): AppRouteRecord[] {
        const featureRoutes: AppRouteRecord[] = []

        try {
            // 使用正确的相对路径扫描 features 目录
            const featureModules = import.meta.glob('../../features/**/routes/index.ts', {
                eager: true
            })

            // 开发环境下输出调试信息
            if (import.meta.env.DEV) {
                console.log('[FeatureModuleScanner] 扫描到的模块路径:', Object.keys(featureModules))
            }

            for (const [modulePath, module] of Object.entries(featureModules)) {
                try {
                    const routes = this.processModuleRoutes(module, modulePath)
                    if (routes) {
                        featureRoutes.push(routes)

                        // 开发环境下输出成功信息
                        if (import.meta.env.DEV) {
                            console.log(`[FeatureModuleScanner] 成功添加路由: ${routes.name || routes.path}`)
                        }
                    }
                } catch (error) {
                    console.warn(`[FeatureModuleScanner] 处理模块路由失败: ${modulePath}`, error)
                }
            }
        } catch (error) {
            console.error('[FeatureModuleScanner] 扫描功能模块失败:', error)
        }

        // 开发环境下输出最终结果
        if (import.meta.env.DEV) {
            console.log(`[FeatureModuleScanner] 最终扫描结果: ${featureRoutes.length} 个路由`)
        }

        return featureRoutes
    }

    /**
     * 处理单个模块的路由配置
     */
    private processModuleRoutes(module: any, modulePath: string): AppRouteRecord | null {
        if (!module || typeof module !== 'object') {
            return null
        }

        // 1. 优先检查默认导出（推荐使用）
        if (module.default && this.isValidRoute(module.default)) {
            return module.default
        }

        // 2. 检查模块本身是否是有效的路由配置（直接导出）
        if (this.isValidRoute(module)) {
            return module
        }

        // 3. 检查常见的命名导出（兼容旧版本）
        const possibleExports = ['routeModules', 'routes', 'moduleRoutes', 'featureRoutes']
        for (const exportName of possibleExports) {
            if (module[exportName] && this.isValidRoute(module[exportName])) {
                return module[exportName]
            }
        }

        return null
    }

    /**
     * 验证路由配置是否有效
     */
    private isValidRoute(route: any): route is AppRouteRecord {
        if (!route || typeof route !== 'object') {
            return false
        }

        // 基本验证：必须有路径或名称
        const hasPathOrName = !!(route.path || route.name)

        // 组件验证：必须有组件或子路由
        const hasComponentOrChildren = !!(route.component || (Array.isArray(route.children) && route.children.length > 0))

        return hasPathOrName && hasComponentOrChildren
    }

    /**
     * 获取扫描到的功能模块路由
     */
    getFeatureRoutes(): AppRouteRecord[] {
        return this.scanFeatures()
    }
}