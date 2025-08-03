import { SearchFormItem } from '@/types'

// 搜索表单配置
export const searchSchemas: SearchFormItem[] = [
  {
    label: '用户名',
    prop: 'm_LIKE_userName',
    type: 'input',
    config: {
      clearable: true
    },
    elColSpan: 6
  },
  {
    label: '姓名',
    prop: 'm_LIKE_realName',
    type: 'input',
    config: {
      clearable: true
    },
    elColSpan: 6
  },
  {
    label: '手机号码',
    prop: 'm_LIKE_mobilePhone',
    type: 'input',
    config: {
      clearable: true
    },
    elColSpan: 6
  },
  {
    label: '是否锁定',
    prop: 'isLocked',
    type: 'dict',
    config: {
      clearable: true,
      multiple: true,
      code: 'yes_no'
    },
    elColSpan: 4
  },
  {
    label: '创建时间',
    prop: 'createTime',
    type: 'daterange',
    config: {
      clearable: true
    },
    elColSpan: 6
  }
]
