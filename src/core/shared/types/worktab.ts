/**
 * 工作标签页类型定义模块
 *
 * @module core/shared/types/worktab
 * @author Mr.April
 */

import { LocationQueryRaw } from 'vue-router'

// 多标签
export interface WorkTab {
  /** 标签标题 */
  title: string
  /** 自定义标题 */
  customTitle?: string
  /** 路由路径 */
  path: string
  /** 路由名称 */
  name: string
  /** 是否缓存 */
  keepAlive: boolean
  /** 是否固定标签 */
  fixedTab?: boolean
  /** 路由参数 */
  params?: object
  /** 路由查询参数 */
  query?: LocationQueryRaw
  /** 图标 */
  icon?: string
  /** 是否激活 */
  isActive?: boolean
}
