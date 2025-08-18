import { FormSchema } from '@/components/form'
import { Icon } from '@/components/icon'
import { TableSchema } from '@/components/table'
import { ColumnOption } from '@/types'

// 搜索表单配置
export const searchSchemas: FormSchema = {
  schema: [
    {
      prop: 'm_LIKE_userName',
      label: '用户名',
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: '请输入用户名'
      },
      colSpan: 6
    },
    {
      prop: 'm_LIKE_realName',
      label: '姓名',
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: '请输入姓名'
      },
      colSpan: 6
    },
    {
      prop: 'm_LIKE_mobilePhone',
      label: '手机号码',
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: '请输入手机号码'
      },
      colSpan: 6
    },
    {
      prop: 'm_EQ_isLocked',
      label: '是否锁定',
      component: 'ApiDict',
      componentProps: {
        clearable: true,
        code: 'yes_no',
        placeholder: '请选择是否锁定'
      },
      colSpan: 6
    }
  ]
}

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
    prop: 'roleIds',
    label: '所属角色',
    component: 'ApiSelect',
    componentProps: {
      api: '/sys/role/select'
    }
  },
  {
    prop: 'mobilePhone',
    label: '手机号码'
  }
]
export const tableSchema: TableSchema = {
  api: '/sys/user/page',
  columns: tableSchemas,
  searchFormSchema: searchSchemas
}
// 表单配置
export const formSchema: FormSchema = {
  showDefaultActions: false,
  labelWidth: '100px',
  schema: [
    // 用户ID（隐藏字段）
    {
      label: '用户ID',
      prop: 'id',
      component: 'Input',
      colSpan: 12,
      show: false,
      ifDetail: false
    },

    // 基础信息分隔符
    {
      prop: 'baseinfo',
      label: '',
      labelWidth: '0px',
      component: 'Divider',
      colSpan: 24,
      componentProps: {
        title: '基础信息'
      }
    },

    // 用户名
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
      ],
      componentProps: {
        placeholder: '请输入用户名',
        clearable: true
      }
    },

    // 姓名
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
      ],
      componentProps: {
        placeholder: '请输入姓名',
        clearable: true
      }
    },

    // 密码
    {
      label: '密码',
      prop: 'password',
      component: 'Input',
      colSpan: 12,
      ifShow(values) {
        // 不存在id，则为新增，显示密码
        return !values.id
      },
      ifDetail: false,
      rules: [
        {
          required: true,
          message: '请输入密码'
        }
      ],
      componentProps: {
        placeholder: '请输入密码',
        clearable: true,
        type: 'password'
      }
    },

    // 确认密码
    {
      label: '确认密码',
      prop: 'confirmPassword',
      component: 'Input',
      colSpan: 12,
      ifShow(values) {
        // 不存在id，则为新增，显示确认密码
        return !values.id
      },
      ifDetail: false,
      rules: [
        {
          required: true,
          message: '请输入确认密码'
        }
      ],
      componentProps: {
        placeholder: '请输入确认密码',
        clearable: true,
        type: 'password'
      }
    },

    // 昵称
    {
      label: '昵称',
      prop: 'nickName',
      component: 'Input',
      colSpan: 12,
      componentProps: {
        placeholder: '请输入昵称',
        clearable: true
      }
    },

    // 性别
    {
      label: '性别',
      prop: 'sex',
      component: 'ApiDict',
      defaultValue: 3,
      colSpan: 12,
      componentProps: {
        placeholder: '请选择性别',
        code: 'sex',
        renderType: 'RadioGroup',
        isBtn: true
      }
    },

    // 邮箱
    {
      label: '邮箱',
      prop: 'email',
      component: 'Input',
      colSpan: 12,
      componentProps: {
        placeholder: '请输入邮箱',
        clearable: true
      }
    },

    // 手机号码
    {
      label: '手机号码',
      prop: 'mobilePhone',
      component: 'Input',
      colSpan: 12,
      rules: [
        {
          required: true,
          message: '请输入手机号码'
        }
      ],
      renderComponentContent() {
        return {
          prefix: () => <Icon icon="&#xe7a1;" />
        }
      },
      componentProps: {
        placeholder: '请输入手机号码',
        clearable: true
      }
    },

    // 其他信息分隔符
    {
      prop: 'otherinfo',
      label: '',
      labelWidth: '0px',
      component: 'Divider',
      colSpan: 24,
      componentProps: {
        title: '其他信息'
      }
    },

    // 所属部门
    {
      label: '所属部门',
      prop: 'deptId',
      component: 'ApiTreeSelect',
      colSpan: 12,
      rules: [
        {
          required: true,
          message: '请选择所属部门'
        }
      ],
      componentProps: {
        placeholder: '请选择所属部门',
        clearable: true,
        api: '/sys/dept/tree',
        labelField: 'name',
        valueField: 'id'
      }
    },

    // 所属岗位
    {
      label: '所属岗位',
      prop: 'postId',
      component: 'ApiSelect',
      colSpan: 12,
      rules: [
        {
          required: true,
          message: '请选择所属岗位'
        }
      ],
      componentProps: {
        placeholder: '请选择所属岗位',
        clearable: true,
        api: '/sys/post/select'
      }
    },

    // 所属角色
    {
      label: '所属角色',
      prop: 'roleIds',
      component: 'ApiSelect',
      colSpan: 24,
      rules: [
        {
          required: true,
          message: '请选择所属角色'
        }
      ],
      ifShow: false,
      ifDetail: true,
      componentProps: {
        placeholder: '请选择所属角色',
        clearable: true,
        api: '/sys/role/select',
        multiple: true
      }
    },

    // 联系电话
    {
      label: '联系电话',
      prop: 'tel',
      component: 'Input',
      colSpan: 24,
      componentProps: {
        placeholder: '请输入联系电话',
        clearable: true
      }
    },

    // 头像
    {
      label: '头像',
      prop: 'avatar',
      component: 'Avatar',
      colSpan: 24,
      componentProps: {}
    },

    // 备注
    {
      label: '备注',
      prop: 'remark',
      component: 'Input',
      colSpan: 24,
      componentProps: {
        type: 'textarea',
        rows: 4,
        placeholder: '请输入备注'
      }
    }
  ]
}
