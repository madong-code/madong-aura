import { Option } from '@/types'
export type ColorType = {
  bgColor?: string
  textColor?: string
}
export type NewOption = Option & ColorType
// 定义字典项的接口
export interface DictItem {
  name: string
  dictItemValue: string | number
  dictItemKey: string
  bgColor?: string
  textColor?: string
  disabled?: boolean
}

// 定义字典的接口
export interface Dict {
  name: string
  dictKey: string
  items: DictItem[]
}
