/**
 * 容器认证用户类型定义模块
 *
 * 容器守卫与用户 Store 使用的用户信息结构。
 * 注意与 user.ts 中 vben 体系的 UserInfo 区分：该文件描述
 * GET /system/auth/user-info 适配后的 madong 容器用户结构
 * （见 api/auth/app.ts 的 fetchGetUserInfo）。
 *
 * @module core/shared/types/auth
 * @author Mr.April
 */

/**
 * 登录用户信息
 *
 * 按钮权限码不走 buttons，统一由 /system/auth/perm-code
 * 注入 core accessStore。
 */
export interface UserInfo {
  /** 按钮权限码列表 */
  buttons: string[]
  /** 角色编码列表 */
  roles: string[]
  /** 用户 ID */
  userId: number
  /** 用户名 */
  userName: string
  /** 邮箱 */
  email: string
  /** 头像 */
  avatar?: string
  /** 是否超级管理员：1 是 0 否（madong 后端字段，控制命令终端等入口） */
  is_super?: number
}
