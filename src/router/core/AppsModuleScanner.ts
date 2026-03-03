/**
 * 功能模块扫描器
 * 
 * 自动扫描 features 目录下的功能模块并生成路由配置
 * 支持默认导出模式
 * 
 * @module router/core/AppsModuleScanner
 * @author Art Design Pro Team
 */

import type { AppRouteRecord } from '@/types/router'

export class AppsModuleScanner {
    private scanCache: { routes: AppRouteRecord[], timestamp: number, files: string[] } | null = null
    private readonly CACHE_TTL = 500 // 500ms 缓存有效期

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
            import.meta.hot.on('vite:beforeUpdate', (payload: any) => {
                const updates = Array.isArray(payload) ? payload : [payload]
                const changedFiles = updates
                    .filter(u => u.url?.includes('/apps/') || u.url?.includes('/routes/'))
                    .map(u => u.url)
                
                if (changedFiles.length > 0) {
                    console.log('[AppsModuleScanner] 检测到 apps 路由文件变化，准备重新扫描...')
                    this.scanCache = null
                }
            })
        }
    }

    /**
     * 扫描 apps 目录并生成路由配置
     */
    scanApps(): AppRouteRecord[] {
        // 开发环境下检查缓存
        if (import.meta.env.DEV && this.scanCache) {
            const now = Date.now()
            if (now - this.scanCache.timestamp < this.CACHE_TTL) {
                if (this.cacheStillValid()) {
                    return this.scanCache.routes
                }
            }
            this.scanCache = null
        }
        const appsRoutes: AppRouteRecord[] = []

        try {
            // 使用正确的相对路径扫描 apps 目录
            const featureModules = import.meta.glob('../../apps/**/routes/index.ts', {
                eager: true
            })

            const moduleFiles = Object.keys(featureModules)

            // 开发环境下输出调试信息
            if (import.meta.env.DEV) {
                console.log(`[AppsModuleScanner] 扫描到 ${moduleFiles.length} 个 apps 模块`)
            }

            for (const [modulePath, module] of Object.entries(featureModules)) {
                try {
                    const routes = this.processModuleRoutes(module, modulePath)
                    if (routes) {
                        appsRoutes.push(routes)

                        // 开发环境下输出成功信息
                        if (import.meta.env.DEV) {
                            //@ts-ignore
                            console.log(`[AppsModuleScanner] ✓ ${routes.name || routes.path}`)
                        }
                    }
                } catch (error) {
                    console.warn(`[AppsModuleScanner] ✗ ${modulePath}`, error)
                }
            }
        } catch (error) {
            console.error('[AppsModuleScanner] 扫描功能模块失败:', error)
        }

        // 开发环境下更新缓存
        if (import.meta.env.DEV) {
            this.scanCache = {
                routes: appsRoutes,
                timestamp: Date.now(),
                files: Object.keys(import.meta.glob('../../apps/**/routes/index.ts', { eager: false }))
            }
            console.log(`[AppsModuleScanner] 最终扫描结果: ${appsRoutes.length} 个路由`)
        }

        return appsRoutes
    }

    /**
     * 检查缓存是否仍然有效
     */
    private cacheStillValid(): boolean {
        if (!this.scanCache) return false
        
        const currentFiles = Object.keys(import.meta.glob('../../apps/**/routes/index.ts', { eager: false }))
        
        // 如果文件数量变化，缓存失效
        if (currentFiles.length !== this.scanCache.files.length) {
            return false
        }

        return true
    }

    /**
     * 处理单个模块的路由配置
     */
    private processModuleRoutes(module: any, _modulePath: string): AppRouteRecord | null {
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
        const possibleExports = ['routeModules', 'routes', 'moduleRoutes', 'appRoutes']
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
    getAppsRoutes(): AppRouteRecord[] {
        return this.scanApps()
    }
}