import { FormSchema } from '@/components/form'
import { Icon } from '@/components/icon'
import { ColumnOption, SearchFormItem } from '@/types'

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
// 表格列配置
export const tableSchemas: ColumnOption[] = [
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
  }
]
export const formSchema: FormSchema = {
  showDefaultActions: false,
  schema: [
    {
      label: '用户ID',
      prop: 'id',
      component: 'Input',
      colSpan: 12,
      // 相当于input的type=hidden属性
      show: false
    },
    {
      label: '用户名',
      prop: 'userName',
      component: 'Input',
      colSpan: 12,
      rules: [
        {
          required: true,
          message: '请输入用户名'
        }
      ]
    },
    {
      label: '姓名',
      prop: 'realName',
      component: 'Input',
      colSpan: 12,
      rules: [
        {
          required: true,
          message: '请输入姓名'
        }
      ]
    },
    {
      label: '手机号码',
      prop: 'mobilePhone',
      component: 'Input',
      renderComponentContent() {
        return {
          prefix: () => <Icon icon="&#xe7a1;" />
        }
      },
      rules: [
        {
          required: true,
          message: '请输入手机号码'
        }
      ]
    },
    {
      label: '密码',
      prop: 'password',
      component: 'Input',
      colSpan: 12,
      ifShow(values, formApi) {
        console.log(formApi)
        // 不存在id，则为更新，不显示密码
        return !values.id
      },
      rules: [
        {
          required: true,
          message: '请输入密码'
        }
      ]
    }
  ]
}
