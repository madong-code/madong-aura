/**
 * 框架类型统一集合出口
 *
 * 汇总 vben 框架基础类型（base/*、user.ts）与容器业务类型
 * （router/worktab/config/auth）。与 vben 同名的容器类型
 * （RouteMeta、UserInfo）使用显式导出优先于 export *，
 * 集合内以容器业务版本为准；vben 版本需要时从对应子路径引入：
 *
 * - vben UserInfo：'#/core/shared/types/user'
 * - vben RouteMeta：'#/core/shared/types/base'
 *
 * @module core/shared/types
 * @author Mr.April
 */

// vben 框架基础类型（Recordable、ClassType、BasicUserInfo、MenuRecordRaw 等）
export type * from './base'
// vben 用户信息（集合内 UserInfo 由容器版提供，需要 vben 版时直接引 ./user）
export type * from './user'

// 容器业务类型
export type * from './worktab'
export type * from './config'
export type { AppRouteRecord, RouteMeta } from './router'
export type { UserInfo } from './auth'
