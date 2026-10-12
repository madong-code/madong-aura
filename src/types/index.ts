/**
 * 容器业务类型统一出口
 *
 * 类型物理归属 src/core/shared/types，此处只做门面转发，
 * 业务侧统一从 '@/types' 引入，不依赖类型的物理目录。
 * 集合内与 vben 同名的 RouteMeta、UserInfo 以容器业务版本为准。
 *
 * @module types
 * @author Mr.April
 */
export type * from '#/core/shared/types'
