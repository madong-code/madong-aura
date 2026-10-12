/**
 * 组件加载器
 *
 * 负责动态加载 Vue 组件
 *
 * 视图来源：
 * - src/views/**：框架与业务页面（component 形如 /system/user/index）
 * - src/plugin/**：插件页面（component 形如 plugin/demo/views/index，
 *   与 madong-single generate-routes-backend 的路径契约一致）
 *
 * @module router/core/ComponentLoader
 * @author Mr.April
 */

import { h } from 'vue'

interface ResolveMeta {
  module?: string
  [key: string]: any
}

export class ComponentLoader {
  private viewModules: Record<string, () => Promise<any>>
  private pluginModules: Record<string, () => Promise<any>>

  constructor() {
    // 动态导入 views / plugin 目录下所有 .vue 组件
    this.viewModules = import.meta.glob('../../views/**/*.vue')
    this.pluginModules = import.meta.glob('../../plugin/**/*.vue')
  }

  /**
   * 加载组件
   * @param componentPath 后端菜单 component 字符串
   * @param meta 路由 meta（插件最简写法依赖 meta.module 定位插件）
   */
  load(componentPath: string, meta?: ResolveMeta): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent()
    }

    // 插件页面：命中任一插件路径写法时从 plugin glob 解析
    const pluginFile = this.resolvePluginFile(componentPath, meta?.module)
    if (pluginFile) {
      // 目录形式兜底：.../about → .../about/index.vue
      const withIndex = pluginFile.replace(/\.vue$/, '/index.vue')
      const module = this.pluginModules[`../../${pluginFile}`] ?? this.pluginModules[`../../${withIndex}`]
      if (module) {
        return module
      }
      console.error(
        `[ComponentLoader] 未找到插件组件: ${componentPath}，解析路径: ${pluginFile}`
      )
      return this.createErrorComponent(componentPath)
    }

    // 构建可能的路径
    const fullPath = `../../views${componentPath}.vue`
    const fullPathWithIndex = `../../views${componentPath}/index.vue`

    // 先尝试直接路径，再尝试添加/index的路径
    const module = this.viewModules[fullPath] || this.viewModules[fullPathWithIndex]

    if (!module) {
      console.error(
        `[ComponentLoader] 未找到组件: ${componentPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      )
      return this.createErrorComponent(componentPath)
    }

    return module
  }

  /**
   * 解析插件组件相对路径（glob key 片段，不含 ../../ 前缀）
   *
   * 支持的 component 写法（对齐 madong-single 契约）：
   * - plugin/demo/views/about/test 标准插件路径
   * - /plugin/demo/views/about/test 带前导斜杠
   * - demo:about/test 冒号简写
   * - demo/views/about/test {module}/views 形态
   * - about/test + meta.module=demo 最简写法
   *
   * 返回如 plugin/demo/views/about/test.vue 的片段；非插件路径返回 null
   */
  private resolvePluginFile(component: string, module?: string): null | string {
    const raw = component.trim().replace(/^\/+/, '')

    // 容器布局哨兵（BasicLayout 转换而来）永远走 views，禁止被 module 劫持
    if (raw === 'index/index') {
      return null
    }

    // 冒号简写：demo:about/test → demo/views/about/test
    if (raw.includes(':')) {
      const [mod, template] = raw.split(':', 2)
      if (mod && template) {
        return `plugin/${mod}/views/${template}.vue`
      }
    }

    // 标准插件路径：plugin/demo/views/about/test
    if (raw.startsWith('plugin/')) {
      return `${raw}.vue`
    }

    // {module}/views/... 形态：demo/views/about/test
    const moduleViews = raw.match(/^([^/]+)\/views\/(.+)$/)
    if (moduleViews) {
      return `plugin/${moduleViews[1]}/views/${moduleViews[2]}.vue`
    }

    // 最简写法 + meta.module：about 或 about/test → plugin/demo/views/...
    // meta.module 仅插件菜单携带，框架视图节点不会进入此分支
    if (module && !raw.startsWith('views/') && !raw.startsWith('plugin/')) {
      return `plugin/${module}/views/${raw}.vue`
    }

    return null
  }

  /**
   * 加载布局组件
   */
  loadLayout(): () => Promise<any> {
    return () => import('@/views/index/index.vue')
  }

  /**
   * 加载 iframe 组件
   */
  loadIframe(): () => Promise<any> {
    return () => import('@/views/outside/Iframe.vue')
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
