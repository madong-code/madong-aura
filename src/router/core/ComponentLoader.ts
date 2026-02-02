/**
 * 组件加载器
 *
 * 负责动态加载 Vue 组件
 *
 * @module router/core/ComponentLoader
 * @author Art Design Pro Team
 */

import { h } from 'vue'
import { RoutesAlias } from '../routesAlias'

// 缓存项接口
interface CacheItem {
  loader: () => Promise<any>
  timestamp: number
  hitCount: number
}

// 性能统计接口
interface PerformanceStats {
  totalLoads: number
  cacheHits: number
  averageLoadTime: number
  slowLoads: number
}

export class ComponentLoader {
  private appViewsModules: Record<string, () => Promise<any>> = {}
  private featuresModules: Record<string, () => Promise<any>> = {}
  private layoutModules: Record<string, () => Promise<any>> = {}

  // 组件缓存
  private componentCache: Map<string, CacheItem> = new Map()

  // 性能统计
  private performanceStats: PerformanceStats = {
    totalLoads: 0,
    cacheHits: 0,
    averageLoadTime: 0,
    slowLoads: 0
  }

  // 缓存配置
  private cacheConfig = {
    maxSize: 100, // 最大缓存数量
    ttl: 5 * 60 * 1000, // 缓存有效期 5分钟
    enableStats: import.meta.env.DEV, // 开发环境启用统计
    enabled: !import.meta.env.DEV // 开发环境禁用缓存
  }

  constructor() {
    // 初始化模块映射
    this.refreshModulesMap()

    // 生产环境下定期清理过期缓存
    if (!import.meta.env.DEV) {
      setInterval(() => this.cleanupExpiredCache(), 60 * 1000) // 每分钟清理一次
    }

    // 开发环境下添加热更新支持
    if (import.meta.env.DEV && import.meta.hot) {
      this.setupHMR()
    }
  }

  /**
   * 刷新模块映射
   */
  private refreshModulesMap(): void {
    // 动态导入 app/views 目录下所有 .vue 组件
    this.appViewsModules = import.meta.glob('../../app/views/**/*.vue')
    // 动态导入 features 模块下所有 .vue 组件
    this.featuresModules = import.meta.glob('../../features/**/views/**/*.vue')
    // 动态导入 layout 目录下所有 .vue 组件
    this.layoutModules = import.meta.glob('../../layout/**/*.vue')
  }

  /**
   * 设置热更新支持
   */
  private setupHMR(): void {
    if (import.meta.hot) {
      // 监听组件文件变化
      import.meta.hot.on('vite:beforeUpdate', () => {
        // 刷新模块映射，确保能够捕获到文件变化
        this.refreshModulesMap()
        // 清除缓存，确保下次加载时使用新的模块
        this.clearCache()
      })

      // 监听错误事件，防止热更新失败导致页面崩溃
      import.meta.hot.on('vite:error', (error) => {
        console.warn('[ComponentLoader] 热更新错误:', error)
      })
    }
  }

  /**
   * 加载组件（带缓存）
   */
  load(componentPath: string, moduleName?: string): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent()
    }

    const finalModuleName = moduleName || 'app'
    const cacheKey = this.generateCacheKey(finalModuleName, componentPath)

    // 性能监控开始时间
    const startTime = this.cacheConfig.enableStats ? performance.now() : 0

    // 检查缓存（仅在缓存启用时）
    if (this.cacheConfig.enabled) {
      const cachedItem = this.getFromCache(cacheKey)
      if (cachedItem) {
        if (this.cacheConfig.enableStats) {
          this.recordPerformance(true, performance.now() - startTime)
        }
        return cachedItem
      }
    }

    // 只在开发环境下输出日志
    if (import.meta.env.DEV) {
      console.log(`加载模块 ${finalModuleName} 的组件: ${componentPath}`)
    }

    let componentLoader: () => Promise<any>

    // 检查是否为布局组件路径
    if (this.isLayoutComponent(componentPath)) {
      componentLoader = this.loadLayoutComponent(componentPath)
    }
    // 如果有模块名且不是app，优先从模块的 views 目录加载
    else if (finalModuleName && finalModuleName !== 'app') {
      componentLoader = this.loadFeaturesComponent(componentPath, finalModuleName)
    }
    // 默认从 app/views 目录加载
    else {
      componentLoader = this.loadAppComponent(componentPath)
    }

    // 缓存组件加载器（仅在缓存启用时）
    if (this.cacheConfig.enabled) {
      this.addToCache(cacheKey, componentLoader)
    }

    if (this.cacheConfig.enableStats) {
      this.recordPerformance(false, performance.now() - startTime)
    }

    return componentLoader
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(moduleName: string, componentPath: string): string {
    return `${moduleName}:${componentPath}`
  }

  /**
   * 从缓存获取组件
   */
  private getFromCache(cacheKey: string): (() => Promise<any>) | null {
    const cachedItem = this.componentCache.get(cacheKey)

    if (!cachedItem) {
      return null
    }

    // 检查缓存是否过期
    if (Date.now() - cachedItem.timestamp > this.cacheConfig.ttl) {
      this.componentCache.delete(cacheKey)
      return null
    }

    // 更新命中次数和时间戳
    cachedItem.hitCount++
    cachedItem.timestamp = Date.now()

    return cachedItem.loader
  }

  /**
   * 添加组件到缓存
   */
  private addToCache(cacheKey: string, loader: () => Promise<any>): void {
    // 检查缓存大小，如果超过限制则清理最旧的缓存
    if (this.componentCache.size >= this.cacheConfig.maxSize) {
      this.evictOldestCache()
    }

    const cacheItem: CacheItem = {
      loader,
      timestamp: Date.now(),
      hitCount: 0
    }

    this.componentCache.set(cacheKey, cacheItem)
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpiredCache(): void {
    const now = Date.now()
    for (const [key, item] of this.componentCache.entries()) {
      if (now - item.timestamp > this.cacheConfig.ttl) {
        this.componentCache.delete(key)
      }
    }
  }

  /**
   * 淘汰最旧的缓存项
   */
  private evictOldestCache(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.componentCache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.componentCache.delete(oldestKey)
    }
  }

  /**
   * 记录性能统计
   */
  private recordPerformance(isCacheHit: boolean, loadTime: number): void {
    this.performanceStats.totalLoads++

    if (isCacheHit) {
      this.performanceStats.cacheHits++
    } else {
      // 计算平均加载时间
      const previousTotal = this.performanceStats.averageLoadTime * (this.performanceStats.totalLoads - this.performanceStats.cacheHits - 1)
      this.performanceStats.averageLoadTime = (previousTotal + loadTime) / (this.performanceStats.totalLoads - this.performanceStats.cacheHits)

      // 记录慢加载
      if (loadTime > 100) { // 超过100ms认为是慢加载
        this.performanceStats.slowLoads++
        console.warn(`组件加载较慢: ${loadTime.toFixed(2)}ms`)
      }
    }

    // 开发环境下定期输出统计信息
    if (import.meta.env.DEV && this.performanceStats.totalLoads % 50 === 0) {
      this.logPerformanceStats()
    }
  }

  /**
   * 输出性能统计信息
   */
  private logPerformanceStats(): void {
    const hitRate = this.performanceStats.totalLoads > 0
      ? (this.performanceStats.cacheHits / this.performanceStats.totalLoads * 100).toFixed(2)
      : '0.00'

    console.group('🚀 ComponentLoader 性能统计')
    console.log(`📊 总加载次数: ${this.performanceStats.totalLoads}`)
    console.log(`🎯 缓存命中率: ${hitRate}%`)
    console.log(`⏱️ 平均加载时间: ${this.performanceStats.averageLoadTime.toFixed(2)}ms`)
    console.log(`🐌 慢加载次数: ${this.performanceStats.slowLoads}`)
    console.log(`💾 当前缓存大小: ${this.componentCache.size}`)
    console.groupEnd()
  }

  /**
   * 手动清理缓存
   */
  clearCache(): void {
    this.componentCache.clear()
    if (import.meta.env.DEV) {
      console.log('🧹 组件缓存已清理')
    }
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): PerformanceStats {
    return { ...this.performanceStats }
  }

  /**
   * 获取缓存信息
   */
  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.componentCache.size,
      keys: Array.from(this.componentCache.keys())
    }
  }

  // ... existing code (保持原有的私有方法不变) ...

  /**
   * 标准化路径格式
   */
  private normalizePath(path: string): string {
    // 确保路径以/开头，并且没有连续的斜杠
    return '/' + path.replace(/^\/*|\/*$/g, '').replace(/\/+\//g, '/')
  }

  /**
   * 检查是否为布局组件路径
   */
  private isLayoutComponent(componentPath: string): boolean {
    const normalizedPath = this.normalizePath(componentPath)
    const layoutPaths = [
      '/layout', '/outside', '/default',
      RoutesAlias.Layout, RoutesAlias.Outside
    ].map(path => this.normalizePath(path))

    return layoutPaths.some(path =>
      normalizedPath === path ||
      normalizedPath.startsWith(path + '/')
    )
  }

  /**
   * 加载布局组件
   */
  private loadLayoutComponent(componentPath: string): () => Promise<any> {
    // 处理路由别名映射
    const mappedPath = this.mapRoutesAlias(componentPath)
    const normalizedPath = this.normalizePath(mappedPath)

    // 构建可能的布局路径
    const fullPath = `../../layout${normalizedPath}.vue`
    const fullPathWithIndex = `../../layout${normalizedPath}/index.vue`

    // 先尝试直接路径，再尝试添加/index的路径
    const module = this.layoutModules[fullPath] || this.layoutModules[fullPathWithIndex]

    if (!module) {
      console.error(
        `[ComponentLoader] 未找到布局组件: ${componentPath}，映射路径: ${normalizedPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      )
      return this.createErrorComponent(componentPath)
    }

    // 包装模块加载函数，添加错误处理
    return () => {
      return module().catch(error => {
        console.error(`[ComponentLoader] 加载布局组件失败: ${componentPath}`, error)
        return {
          render() {
            return h('div', { class: 'route-error' }, `布局组件加载失败: ${componentPath}`)
          }
        }
      })
    }
  }

  /**
   * 映射路由别名到实际路径
   */
  private mapRoutesAlias(componentPath: string): string {
    // 处理 RoutesAlias.Layout -> /default
    if (componentPath === RoutesAlias.Layout || componentPath === '/layout') {
      return '/default'
    }
    // 处理 RoutesAlias.Outside -> /outside
    if (componentPath === RoutesAlias.Outside || componentPath === '/outside') {
      return '/outside'
    }
    return componentPath
  }

  /**
   * 从 app/views 目录加载组件
   */
  private loadAppComponent(componentPath: string): () => Promise<any> {
    const normalizedPath = this.normalizePath(componentPath)
    
    // 构建可能的路径
    const fullPath = `../../app/views${normalizedPath}.vue`
    const fullPathWithIndex = `../../app/views${normalizedPath}/index.vue`

    // 先尝试直接路径，再尝试添加/index的路径
    const module = this.appViewsModules[fullPath] || this.appViewsModules[fullPathWithIndex]

    if (!module) {
      console.error(
        `[ComponentLoader] 未找到组件: ${componentPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      )
      return this.createErrorComponent(componentPath)
    }

    // 包装模块加载函数，添加错误处理
    return () => {
      return module().catch(error => {
        console.error(`[ComponentLoader] 加载组件失败: ${componentPath}`, error)
        return {
          render() {
            return h('div', { class: 'route-error' }, `组件加载失败: ${componentPath}`)
          }
        }
      })
    }
  }

  /**
   * 从 features 模块的 views 目录加载组件
   */
  private loadFeaturesComponent(componentPath: string, moduleName: string): () => Promise<any> {
    const normalizedPath = this.normalizePath(componentPath)
    
    // 构建可能的路径
    const fullPath = `../../features/${moduleName}/views${normalizedPath}.vue`
    const fullPathWithIndex = `../../features/${moduleName}/views${normalizedPath}/index.vue`

    // 先尝试直接路径，再尝试添加/index的路径
    const module = this.featuresModules[fullPath] || this.featuresModules[fullPathWithIndex]

    if (!module) {
      console.error(
        `[ComponentLoader] 未找到模块 ${moduleName} 的组件: ${componentPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      )
      // 如果模块中找不到，尝试从 app/views 目录加载
      return this.loadAppComponent(componentPath)
    }

    // 包装模块加载函数，添加错误处理
    return () => {
      return module().catch(error => {
        console.error(`[ComponentLoader] 加载模块 ${moduleName} 的组件失败: ${componentPath}`, error)
        return {
          render() {
            return h('div', { class: 'route-error' }, `模块 ${moduleName} 的组件加载失败: ${componentPath}`)
          }
        }
      })
    }
  }

  /**
   * 加载默认布局组件
   */
  loadLayout(): () => Promise<any> {
    return () => {
      return import('@/layout/index.vue').catch(error => {
        console.error('[ComponentLoader] 加载默认布局组件失败', error)
        return {
          render() {
            return h('div', { class: 'route-error' }, '默认布局组件加载失败')
          }
        }
      })
    }
  }

  /**
   * 加载 iframe 组件
   */
  loadIframe(): () => Promise<any> {
    return () => {
      return import('@/layout/outside/index.vue').catch(error => {
        console.error('[ComponentLoader] 加载 iframe 组件失败', error)
        return {
          render() {
            return h('div', { class: 'route-error' }, 'iframe 组件加载失败')
          }
        }
      })
    }
  }

  /**
   * 创建空组件
   */
  private createEmptyComponent(): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', {})
        }
      })
  }

  /**
   * 创建错误提示组件
   */
  private createErrorComponent(componentPath: string): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', { class: 'route-error' }, `组件未找到: ${componentPath}`)
        }
      })
  }
}