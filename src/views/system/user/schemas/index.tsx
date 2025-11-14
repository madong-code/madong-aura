import { CrudSchema } from '@/components/crud'
import { UserService } from '@/api/system/user'
import { $t } from '@/locales'
import { RendererElement, RendererNode, VNodeArrayChildren } from 'vue'
import { DictEnum } from '@/enums'

// crud配置
export const crudSchema: CrudSchema = {
  // 接口地址
  api: UserService.list,
  dialogTitle: '用户',
  crudApi: {
    // 新增接口
    add: UserService.create,
    // 修改接口
    edit: UserService.update,
    // 删除接口
    remove: UserService.remove,
    // 详情接口
    view: UserService.get
  },
  // 使用crud
  useCrud: true,
  // 是否有新增
  hasAdd: true,
  // 是否有删除
  hasRemove: true,
  // 是否有修改
  hasEdit: true,
  // 是否有详情
  hasView: true,
  // 新增权限码
  addAuth: 'system:user:create',
  // 删除权限码
  removeAuth: 'system:user:delete',
  // 修改权限码
  editAuth: 'system:user:update',
  // 详情权限码
  viewAuth: 'system:user:read',
  // 表格列定义
  columns: [
    {
      type: 'selection'
    },

    {
      prop: 'user_name',
      label: $t('system.user.list.table.columns.user_name'),
      minWidth: 80
    },
    {
      prop: 'real_name',
      label: $t('system.user.list.table.columns.real_name'),
      minWidth: 130
    },
    {
      prop: 'avatar',
      label: $t('system.user.list.table.columns.avatar'),
      cellRender: {
        name: 'CellImage'
      },
      minWidth: 80,
      visible: false
    },
    {
      prop: 'dept_name',
      label: $t('system.user.list.table.columns.dept_name'),
      minWidth: 100,
      formatter: (row) => {
        const data = row?.depts || []
        return h(
          'div',
          data.map(
            (dept: {
              id: any
              name:
              | string
              | number
              | boolean
              | VNodeArrayChildren
              | { [name: string]: unknown; $stable?: boolean }
              | VNode<RendererNode, RendererElement, { [key: string]: any }>
              | (() => any)
              | undefined
            }) => h(ElTag, { key: dept.id }, dept.name)
          )
        )
      }
    },
    {
      prop: 'mobile_phone',
      label: $t('system.user.list.table.columns.mobile_phone'),
      formatter(row) {
        return row.mobile_phone
      },
      minWidth: 120
    },
    {
      prop: 'enabled',
      label: $t('system.user.list.table.columns.enabled'),
      component: 'ApiDict',
      componentProps: {
        code: DictEnum.SYS_ENABLED_STATUS,
        typeMap: {
          1: 'success',
          0: 'danger'
        },
        useColorList: false
      }
    },
    {
      prop: 'is_locked',
      label: $t('system.user.list.table.columns.is_locked'),
      component: 'ApiDict',
      minWidth: 150,
      componentProps: {
        code: DictEnum.SYS_LOCKED_STATUS,
        typeMap: {
          1: 'success',
          0: 'danger'
        },
        useColorList: false
      }
    }
    // {
    //   prop: 'created_date',
    //   label: $t('user.list.table.columns.created_date'),
    //   minWidth: 150,
    //   componentProps: {}
    // }
  ],
  // 搜索表单定义
  searchFormSchema: {
    schema: [
      {
        prop: 'LIKE_user_name',
        label: $t('system.user.list.query.user_name'),
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: $t('system.user.list.query.placeholder.user_name')
        },
        colSpan: 6
      },
      {
        prop: 'LIKE_real_name',
        label: $t('system.user.list.query.real_name'),
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: $t('system.user.list.query.placeholder.real_name')
        },
        colSpan: 6
      },
      {
        prop: 'LIKE_mobile_phone',
        label: $t('system.user.list.query.mobile_phone'),
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: $t('system.user.list.query.placeholder.mobile_phone')
        },
        colSpan: 6
      },
      {
        prop: 'EQ_is_locked',
        label: $t('system.user.list.query.is_locked'),
        component: 'ApiDict',
        componentProps: {
          clearable: true,
          code: 'yes_no',
          placeholder: $t('system.user.list.query.placeholder.enabled')
        },
        colSpan: 6
      }
    ]
  },
  // 内置弹窗配置
  dialogProps: {
    dialogType: 'drawer',
    width: '50%'
  },
  // crud表单配置
  formSchema: {
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
      {
        component: 'Input',
        prop: 'user_name',
        label: $t('system.user.form.modal.user_name'),
        componentProps: {
          placeholder: $t('system.user.form.placeholder.user_name')
        },
        colSpan: 12,
        rules: [
          {
            required: true,
            message: $t('system.user.form.placeholder.user_name')
          }
        ]
      },
      {
        component: 'Input',
        prop: 'password',
        label: $t('system.user.form.modal.password'),
        componentProps: {
          placeholder: $t('system.user.form.placeholder.password')
        },
        rules: [
          {
            required: true,
            message: $t('system.user.form.placeholder.password')
          }
        ],
        colSpan: 12
      },
      {
        component: 'Input',
        prop: 'real_name',
        label: $t('system.user.form.modal.real_name'),
        componentProps: {
          placeholder: $t('system.user.form.placeholder.real_name')
        },
        rules: [
          {
            required: true,
            message: $t('system.user.form.placeholder.real_name')
          }
        ],
        colSpan: 12
      },
      {
        component: 'Input',
        prop: 'mobile_phone',
        label: $t('system.user.form.modal.mobile_phone'),
        defaultValue: undefined,
        componentProps: {
          placeholder: $t('system.user.form.placeholder.mobile_phone')
        },
        rules: [
          {
            required: true,
            message: $t('system.user.form.placeholder.mobile_phone')
          }
        ],
        colSpan: 12
      },
      {
        component: 'Input',
        prop: 'email',
        defaultValue: undefined,
        label: $t('system.user.form.modal.email'),
        componentProps: {
          placeholder: $t('system.user.form.placeholder.email')
        },
        rules: [
          {
            required: true,
            message: $t('system.user.form.placeholder.email')
          }
        ],
        colSpan: 12
      },
      {
        label: $t('system.user.form.modal.sex'),
        prop: 'sex',
        component: 'ApiDict',
        defaultValue: 0,
        colSpan: 12,
        componentProps: {
          code: DictEnum.SYS_SEX,
          renderType: 'RadioGroup',
          isBtn: true
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
        label: $t('system.user.form.modal.dept_name'),
        prop: 'dept_id',
        component: 'ApiTreeSelect',
        colSpan: 12,
        rules: [
          {
            required: false,
            message: $t('system.user.form.placeholder.dept_name')
          }
        ],
        componentProps: {
          placeholder: $t('system.user.form.placeholder.dept_name'),
          clearable: true,
          api: '/system/dept/getTree',
          params: { format: 'tree' },
          labelField: 'name',
          valueField: 'id'
        }
      },
      // 所属岗位
      {
        label: $t('system.user.form.modal.post_name'),
        prop: 'post_id_list',
        defaultValue: [],
        component: 'ApiSelect',
        colSpan: 12,
        rules: [
          {
            required: false,
            message: $t('system.user.form.placeholder.post_name')
          }
        ],
        componentProps: {
          placeholder: $t('system.user.form.placeholder.post_name'),
          clearable: true,
          api: '/system/post',
          requestMethod: 'get',
          params: { format: 'select' }
        }
      },

      // 所属角色
      {
        label: $t('system.user.form.modal.role_name'),
        prop: 'role_id_list',
        component: 'ApiSelect',
        colSpan: 24,
        rules: [
          {
            required: false,
            message: '请选择所属角色'
          }
        ],
        ifShow: false,
        ifDetail: true,
        componentProps: {
          placeholder: $t('system.user.form.placeholder.role_name'),
          clearable: true,
          api: '/system/role',
          requestMethod: 'get',
          params: { format: 'select' },
          multiple: true
        }
      },
      {
        label: $t('system.user.form.modal.avatar'),
        prop: 'avatar',
        component: 'Avatar',
        colSpan: 24,
        componentProps: {}
      },
      {
        label: $t('system.user.form.modal.remark'),
        prop: 'remark',
        component: 'Input',
        colSpan: 24,
        componentProps: {
          type: 'textarea',
          rows: 4,
          placeholder: $t('system.user.form.placeholder.remark')
        }
      }
    ]
  }
}
