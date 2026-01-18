/**
 * 组件加载器
 *
 * 负责动态加载 Vue 组件
 *
 * @module router/core/ComponentLoader
 * @author Art Design Pro Team
 */

import { h } from 'vue'

export class ComponentLoader {
  private appViewsModules: Record<string, () => Promise<any>>
  private featuresModules: Record<string, () => Promise<any>>

  constructor() {
    // 动态导入 app/views 目录下所有 .vue 组件
    this.appViewsModules = import.meta.glob('../../app/views/**/*.vue')
    // 动态导入 features 模块下所有 .vue 组件
    this.featuresModules = import.meta.glob('../../features/**/views/**/*.vue')
  }

  /**
   * 加载组件
   */
  load(componentPath: string, moduleName?: string): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent()
    }

    // 如果有模块名，优先从模块的 views 目录加载
    if (moduleName && moduleName !== 'app') {
      return this.loadFeaturesComponent(componentPath, moduleName)
    }

    // 默认从 app/views 目录加载
    return this.loadAppComponent(componentPath)
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
   * 加载布局组件
   */
  loadLayout(): () => Promise<any> {
    return () => import('@/app/views/layout/index.vue')
  }

  /**
   * 加载 iframe 组件
   */
  loadIframe(): () => Promise<any> {
    return () => import('@/app/views/outside/Iframe.vue')
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