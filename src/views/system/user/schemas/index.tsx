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
  hasView: false,
  // 新增权限码
  addAuth: 'system:user:save',
  // 删除权限码
  removeAuth: 'system:user:remove',
  // 修改权限码
  editAuth: 'system:user:update',
  // 详情权限码
  viewAuth: 'system:user:detail',
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
          placeholder: '请输入姓名'
        },
        colSpan: 6
      },
      {
        prop: 'LIKE_mobile_phone',
        label: '手机号码',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入手机号码'
        },
        colSpan: 6
      },
      {
        prop: 'EQ_is_locked',
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
  },
  // 内置弹窗配置
  dialogProps: {
    dialogType: 'drawer'
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

      // // 用户名
      // {
      //   label: '用户名',
      //   prop: 'user_name',
      //   component: 'Input',
      //   colSpan: 12,
      //   rules: [
      //     {
      //       required: true,
      //       message: '请输入用户名'
      //     }
      //   ],
      //   componentProps: {
      //     placeholder: '请输入用户名',
      //     clearable: true
      //   }
      // },

      // // 姓名
      // {
      //   label: '姓名',
      //   prop: 'realName',
      //   component: 'Input',
      //   colSpan: 12,
      //   rules: [
      //     {
      //       required: true,
      //       message: '请输入姓名'
      //     }
      //   ],
      //   componentProps: {
      //     placeholder: '请输入姓名',
      //     clearable: true
      //   }
      // },

      // // 密码
      // {
      //   label: '密码',
      //   prop: 'password',
      //   component: 'Input',
      //   colSpan: 12,
      //   ifShow(values) {
      //     // 不存在id，则为新增，显示密码
      //     return !values.id
      //   },
      //   ifDetail: false,
      //   helpMessage: ['5-18位数字、字母、特殊字符组成。'],
      //   rules: [
      //     {
      //       required: true,
      //       message: '请输入密码'
      //     },
      //     {
      //       pattern: /[\w!@#$%^&*]{5,18}/,
      //       message: '密码由5-18位数字、字母、特殊字符组成。'
      //     }
      //   ],
      //   componentProps: {
      //     placeholder: '请输入密码',
      //     clearable: true,
      //     type: 'password'
      //   }
      // },

      // // 确认密码
      // {
      //   label: '确认密码',
      //   prop: 'confirmPassword',
      //   component: 'Input',
      //   colSpan: 12,
      //   ifShow(values) {
      //     // 不存在id，则为新增，显示确认密码
      //     return !values.id
      //   },
      //   ifDetail: false,
      //   rules: [
      //     {
      //       required: true,
      //       message: '请输入确认密码'
      //     }
      //   ],
      //   componentProps: {
      //     placeholder: '请输入确认密码',
      //     clearable: true,
      //     type: 'password'
      //   }
      // },

      // // 昵称
      // {
      //   label: '昵称',
      //   prop: 'nickName',
      //   component: 'Input',
      //   colSpan: 12,
      //   componentProps: {
      //     placeholder: '请输入昵称',
      //     clearable: true
      //   }
      // },

      // // 性别
      // {
      //   label: '性别',
      //   prop: 'sex',
      //   component: 'ApiDict',
      //   defaultValue: 3,
      //   colSpan: 12,
      //   componentProps: {
      //     placeholder: '请选择性别',
      //     code: 'sex',
      //     renderType: 'RadioGroup',
      //     isBtn: true
      //   }
      // },

      // // 邮箱
      // {
      //   label: '邮箱',
      //   prop: 'email',
      //   component: 'Input',
      //   colSpan: 12,
      //   componentProps: {
      //     placeholder: '请输入邮箱',
      //     clearable: true
      //   }
      // },

      // // 手机号码
      // {
      //   label: '手机号码',
      //   prop: 'mobilePhone',
      //   component: 'Input',
      //   colSpan: 12,
      //   rules: [
      //     {
      //       required: true,
      //       message: '请输入手机号码'
      //     }
      //   ],
      //   componentProps: {
      //     placeholder: '请输入手机号码',
      //     clearable: true
      //   }
      // },

      // // 其他信息分隔符
      // {
      //   prop: 'otherinfo',
      //   label: '',
      //   labelWidth: '0px',
      //   component: 'Divider',
      //   colSpan: 24,
      //   componentProps: {
      //     title: '其他信息'
      //   }
      // },

      // // 所属部门
      // {
      //   label: '所属部门',
      //   prop: 'deptId',
      //   component: 'ApiTreeSelect',
      //   colSpan: 12,
      //   rules: [
      //     {
      //       required: true,
      //       message: '请选择所属部门'
      //     }
      //   ],
      //   componentProps: {
      //     placeholder: '请选择所属部门',
      //     clearable: true,
      //     api: '/system/dept/tree',
      //     labelField: 'name',
      //     valueField: 'id'
      //   }
      // },

      // // 所属岗位
      // {
      //   label: '所属岗位',
      //   prop: 'postId',
      //   component: 'ApiSelect',
      //   colSpan: 12,
      //   rules: [
      //     {
      //       required: true,
      //       message: '请选择所属岗位'
      //     }
      //   ],
      //   componentProps: {
      //     placeholder: '请选择所属岗位',
      //     clearable: true,
      //     api: '/system/post/select'
      //   }
      // },

      // // 所属角色
      // {
      //   label: '所属角色',
      //   prop: 'roleIds',
      //   component: 'ApiSelect',
      //   colSpan: 24,
      //   rules: [
      //     {
      //       required: true,
      //       message: '请选择所属角色'
      //     }
      //   ],
      //   ifShow: false,
      //   ifDetail: true,
      //   componentProps: {
      //     placeholder: '请选择所属角色',
      //     clearable: true,
      //     api: '/system/role/select',
      //     multiple: true
      //   }
      // },

      // // 联系电话
      // {
      //   label: '联系电话',
      //   prop: 'tel',
      //   component: 'Input',
      //   colSpan: 24,
      //   componentProps: {
      //     placeholder: '请输入联系电话',
      //     clearable: true
      //   }
      // },

      // // 头像
      // {
      //   label: '头像',
      //   prop: 'avatar',
      //   component: 'Avatar',
      //   colSpan: 24,
      //   componentProps: {}
      // },

      // // 备注
      // {
      //   label: '备注',
      //   prop: 'remark',
      //   component: 'Input',
      //   colSpan: 24,
      //   componentProps: {
      //     type: 'textarea',
      //     rows: 4,
      //     placeholder: '请输入备注'
      //   }
      // }

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
      }
      // {
      //   component: 'RadioGroup',
      //   componentProps: {
      //     buttonStyle: 'solid',
      //     options: getDictOptions(DictEnum.SYS_SEX),
      //     optionType: 'button'
      //   },
      //   defaultValue: 0,
      //   prop: 'sex',
      //   label: $t('system.user.form.modal.sex')
      // },
      // {
      //   component: 'RadioGroup',
      //   componentProps: {
      //     buttonStyle: 'solid',
      //     options: getDictOptions(DictEnum.SYS_YES_NO),
      //     optionType: 'button'
      //   },
      //   defaultValue: 0,
      //   prop: 'enabled',
      //   label: $t('system.user.form.modal.enabled')
      // },
      // {
      //   component: 'TreeSelect',
      //   componentProps: {
      //     getPopupContainer,
      //     allowClear: true,
      //     mode: 'multiple',
      //     optionFilterProp: 'label',
      //     optionLabelProp: 'label',
      //     placeholder: $t('system.user.form.placeholder.dept_name')
      //   },
      //   prop: 'dept_id',
      //   label: $t('system.user.form.modal.dept_name')
      // },
      // {
      //   component: 'Select',
      //   componentProps: {
      //     getPopupContainer,
      //     mode: 'multiple',
      //     optionFilterProp: 'label',
      //     optionLabelProp: 'label',
      //     placeholder: $t('system.user.form.placeholder.post_name')
      //   },
      //   prop: 'post_id_list',
      //   label: $t('system.user.form.modal.post_name')
      // },
      // {
      //   component: 'ApiSelect',
      //   componentProps: {
      //     mode: 'multiple',
      //     allowClear: true,
      //     api: () => {
      //       return roleApi.list({ format: 'select' })
      //     },
      //     class: 'w-full',
      //     labelField: 'label',
      //     valueField: 'value',
      //     placeholder: $t('system.user.form.placeholder.role_name')
      //   },
      //   prop: 'role_id_list',
      //   label: $t('system.user.form.modal.role_name'),
      //   rules: 'selectRequired'
      // },
      // {
      //   component: 'Textarea',
      //   prop: 'remark',
      //   formItemClass: 'items-start',
      //   label: $t('system.user.form.modal.remark'),
      //   componentProps: {
      //     placeholder: $t('system.user.form.placeholder.remark')
      //   }
      // }
    ]
  }
}
