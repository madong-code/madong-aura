/**
 * 系统字典键常量
 * 注：实际数据通过API动态获取
 */
import { DictEnum as BaseDictEnum } from "@/enums"

export const DictEnum = {
  // 权限管控类型
  DOC_PERMISSION_TYPE: 'official.PermissionType',
  ...BaseDictEnum
} as const

export type DictEnumKey = keyof typeof DictEnum
