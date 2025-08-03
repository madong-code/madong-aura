import { ActionItem, TableAction } from '@/components/table-action'
import { ColumnOption, SearchFormItem } from '@/types'
type OpMethodType = {
  edit?: (row: unknown) => void
  delete?: (row: unknown) => void
}

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
// 表格列构造工厂
export const columnsFactory = (opObj: OpMethodType): ColumnOption[] => {
  return [
    {
      type: 'selection'
    },
    {
      prop: 'userName',
      label: '用户名'
    },
    {
      prop: 'realName',
      label: '姓名'
    },
    {
      prop: 'isLocked',
      label: '是否锁定',
      component: 'ApiDict',
      componentProps: {
        code: 'yes_no',
        typeMap: {
          1: 'success',
          0: 'danger'
        },
        useColorList: false
      }
    },
    {
      prop: 'mobilePhone',
      label: '手机号码'
    },
    {
      prop: '__ACTION__',
      label: '操作',
      width: 120,
      fixed: 'right', // 固定列
      formatter: (row: unknown) => {
        const actions: ActionItem[] = [
          {
            label: '编辑',
            type: 'primary',
            link: true,
            size: 'small',
            auth: 'sys:user:update',
            onClick: opObj.edit?.bind(null, row)
          }
        ]
        const dropDownActions: ActionItem[] = [
          {
            label: '删除',
            type: 'danger',
            icon: '&#xe783;',
            size: 'small',
            auth: 'sys:user:remove',
            confirm: {
              title: '提示',
              content: '确定删除吗？',
              ok: opObj.delete?.bind(null, row)
            }
          }
        ]
        return <TableAction actions={actions} dropDownActions={dropDownActions} />
      }
    }
  ]
}
