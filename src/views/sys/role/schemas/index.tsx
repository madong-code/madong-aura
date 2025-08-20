import { RoleService } from '@/api/sys/role'
import { TableSchema } from '@/components/table'

// 表格列配置
export const tableSchema: TableSchema = {
  // 接口地址
  api: RoleService.page,
  dialogTitle: '角色',
  crudApi: {
    // 新增接口
    add: RoleService.save,
    // 修改接口
    edit: RoleService.update,
    // 删除接口
    remove: RoleService.remove,
    // 详情接口
    view: RoleService.detail
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
  addAuth: 'sys:role:save',
  // 删除权限码
  removeAuth: 'sys:role:remove',
  // 修改权限码
  editAuth: 'sys:role:update',
  // 详情权限码
  viewAuth: 'sys:role:detail',
  // 表格列定义
  columns: [
    {
      type: 'selection'
    },
    {
      prop: 'name',
      label: '角色名称'
    },
    {
      prop: 'code',
      label: '唯一编码'
    },
    {
      prop: 'roleType',
      label: '角色类型',
      component: 'ApiDict',
      componentProps: {
        code: 'sys_role_role_type'
      }
    },
    {
      prop: 'enabled',
      label: '是否启用',
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
      prop: 'remark',
      label: '备注'
    }
  ],
  // 搜索表单定义
  searchFormSchema: {
    schema: [
      {
        prop: 'm_LIKE_name',
        label: '角色名称',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入角色名称'
        },
        colSpan: 6
      },
      {
        prop: 'm_LIKE_code',
        label: '唯一编码',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入唯一编码'
        },
        colSpan: 6
      },
      {
        prop: 'm_EQ_enabled',
        label: '是否启用',
        component: 'ApiDict',
        componentProps: {
          clearable: true,
          code: 'yes_no',
          placeholder: '请选择',
          renderType: 'Select'
        },
        colSpan: 6
      }
    ]
  },
  // 内置弹窗配置
  dialogProps: {
    width: '40%'
    // dialogType: 'drawer'
  },
  // crud表单配置
  formSchema: {
    showDefaultActions: false,
    labelWidth: '100px',
    schema: [
      // 角色ID（隐藏字段）
      {
        label: '角色ID',
        prop: 'id',
        component: 'Input',
        colSpan: 24,
        show: false,
        ifDetail: false
      },

      // 角色名称
      {
        label: '角色名称',
        prop: 'name',
        component: 'Input',
        colSpan: 24,
        rules: [
          {
            required: true,
            message: '请输入角色名称'
          }
        ],
        componentProps: {
          placeholder: '请输入角色名称',
          clearable: true
        }
      },

      // 唯一编码
      {
        label: '唯一编码',
        prop: 'code',
        component: 'Input',
        colSpan: 24,
        rules: [
          {
            required: true,
            message: '请输入唯一编码'
          }
        ],
        componentProps: {
          placeholder: '请输入唯一编码',
          clearable: true
        }
      },

      // 角色类型
      {
        label: '角色类型',
        prop: 'roleType',
        component: 'ApiDict',
        colSpan: 24,
        componentProps: {
          placeholder: '请选择角色类型',
          code: 'sys_role_role_type',
          clearable: true
        }
      },

      // 是否启用
      {
        label: '是否启用',
        prop: 'enabled',
        component: 'ApiDict',
        defaultValue: 1,
        colSpan: 24,
        rules: [
          {
            required: true,
            message: '请选择是否启用'
          }
        ],
        componentProps: {
          placeholder: '请选择是否启用',
          code: 'yes_no',
          isBtn: true,
          renderType: 'RadioGroup'
        }
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
}
