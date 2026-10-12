import { requestClient } from '#/api/request'
import type { UserInfo } from '@/types'

/**
 * 容器用户信息适配
 *
 * 容器守卫使用 fetchGetUserInfo() 拉取用户信息，底层改为 madong 契约
 * GET /system/auth/user-info（requestClient 已剥离 { code, data } 包装），
 * 并把后端字段映射为容器需要的 UserInfo 结构。
 * 按钮权限码不走 userInfo.buttons，统一由 /system/auth/perm-code 注入 core accessStore。
 */
interface MadongUserInfo {
  id?: number | string
  user_name?: string
  username?: string
  real_name?: string
  avatar?: string
  email?: string
  roles?: Array<{ id?: number; name?: string } | string>
  [key: string]: any
}

export async function fetchGetUserInfo(): Promise<UserInfo> {
  const data = await requestClient.get<MadongUserInfo>('/system/auth/user-info')
  const roles = Array.isArray(data.roles)
    ? data.roles.map((r) => (typeof r === 'string' ? r : r?.name ?? ''))
    : []

  return {
    userId: Number(data.id ?? 0),
    userName: data.username ?? data.user_name ?? '',
    email: data.email ?? '',
    avatar: data.avatar ?? '',
    roles: roles.filter(Boolean),
    buttons: [],
    // 超级管理员标记：命令终端等入口按该字段放行
    is_super: Number(data.is_super ?? 0)
  }
}
