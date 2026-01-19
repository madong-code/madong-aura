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

export class ComponentLoader {
  private appViewsModules: Record<string, () => Promise<any>>
  private featuresModules: Record<string, () => Promise<any>>
  private layoutModules: Record<string, () => Promise<any>>

  constructor() {
    // 动态导入 app/views 目录下所有 .vue 组件
    this.appViewsModules = import.meta.glob('../../app/views/**/*.vue')
    // 动态导入 features 模块下所有 .vue 组件
    this.featuresModules = import.meta.glob('../../features/**/views/**/*.vue')
    // 动态导入 layout 目录下所有 .vue 组件
    this.layoutModules = import.meta.glob('../../layout/**/*.vue')
  }

  /**
   * 加载组件
   */
  load(componentPath: string, moduleName?: string): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent()
    }

    // 自动处理未定义的模块名
    const finalModuleName = moduleName || 'app'
    console.log(`加载模块 ${finalModuleName} 的组件: ${componentPath}`)

    // 检查是否为布局组件路径
    if (this.isLayoutComponent(componentPath)) {
      return this.loadLayoutComponent(componentPath)
    }

    // 如果有模块名且不是app，优先从模块的 views 目录加载
    if (finalModuleName && finalModuleName !== 'app') {
      return this.loadFeaturesComponent(componentPath, finalModuleName)
    }

    // 默认从 app/views 目录加载
    return this.loadAppComponent(componentPath)
  }

  /**
   * 检查是否为布局组件路径
   */
  private isLayoutComponent(componentPath: string): boolean {
    const layoutPaths = [
      '/layout', '/outside', '/default',
      RoutesAlias.Layout, RoutesAlias.Outside
    ]
    return layoutPaths.some(path =>
      componentPath.startsWith(path) ||
      componentPath === path ||
      componentPath.includes(path.replace('/', ''))
    )
  }

  /**
   * 加载布局组件
   */
  private loadLayoutComponent(componentPath: string): () => Promise<any> {
    // 处理路由别名映射
    const mappedPath = this.mapRoutesAlias(componentPath)

    // 构建可能的布局路径
    const fullPath = `../../layout${mappedPath}.vue`
    const fullPathWithIndex = `../../layout${mappedPath}/index.vue`

    // 先尝试直接路径，再尝试添加/index的路径
    const module = this.layoutModules[fullPath] || this.layoutModules[fullPathWithIndex]

    if (!module) {
      console.error(
        `[ComponentLoader] 未找到布局组件: ${componentPath}，映射路径: ${mappedPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      )
      return this.createErrorComponent(componentPath)
    }

    return module
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
    // 构建可能的路径
    const fullPath = `../../app/views${componentPath}.vue`
    const fullPathWithIndex = `../../app/views${componentPath}/index.vue`

    // 先尝试直接路径，再尝试添加/index的路径
    const module = this.appViewsModules[fullPath] || this.appViewsModules[fullPathWithIndex]

    if (!module) {
      console.error(
        `[ComponentLoader] 未找到组件: ${componentPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      )
      return this.createErrorComponent(componentPath)
    }

    return module
  }

  /**
   * 从 features 模块的 views 目录加载组件
   */
  private loadFeaturesComponent(componentPath: string, moduleName: string): () => Promise<any> {
    // 构建可能的路径
    const fullPath = `../../features/${moduleName}/views${componentPath}.vue`
    const fullPathWithIndex = `../../features/${moduleName}/views${componentPath}/index.vue`

    // 先尝试直接路径，再尝试添加/index的路径
    const module = this.featuresModules[fullPath] || this.featuresModules[fullPathWithIndex]

    if (!module) {
      console.error(
        `[ComponentLoader] 未找到模块 ${moduleName} 的组件: ${componentPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      )
      // 如果模块中找不到，尝试从 app/views 目录加载
      return this.loadAppComponent(componentPath)
    }

    return module
  }

  /**
   * 加载默认布局组件
   */
  loadLayout(): () => Promise<any> {
    return () => import('@/layout/index.vue')
  }

  /**
   * 加载 iframe 组件
   */
  loadIframe(): () => Promise<any> {
    return () => import('@/layout/outside/index.vue')
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