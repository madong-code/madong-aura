import { RoleService } from '@/app/api/system/role'
import { CrudSchema } from '@/components/crud'
import { DictEnum } from '@/app/enums'
import { $t } from '@/locales'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: RoleService.list,
    dialogTitle: $t('system.role.list.title'),
    crudApi: {
      // 新增接口
      add: RoleService.create,
      // 修改接口
      edit: RoleService.update,
      // 删除接口
      remove: RoleService.remove,
      // 详情接口
      view: RoleService.get
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
    addAuth: 'system:role:create',
    // 删除权限码
    removeAuth: 'system:role:delete',
    // 修改权限码
    editAuth: 'system:role:update',
    // 详情权限码
    viewAuth: 'system:role:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'name',
        label: $t('system.role.list.table.columns.role_name')
      },
      {
        prop: 'code',
        label: $t('system.role.list.table.columns.code')
      },
      {
        prop: 'role_type',
        label: $t('system.role.list.table.columns.role_type'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ROLE_TYPE
        }
      },
      {
        prop: 'enabled',
        label: $t('system.role.list.table.columns.enabled'),
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
        prop: 'remark',
        label: $t('system.role.list.table.columns.remark')
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      schema: [
        {
          prop: 'LIKE_code',
          label: $t('system.role.list.query.code'),
          component: 'Input',
          componentProps: {
            clearable: true,
            placeholder: $t('system.role.list.query.placeholder.code')
          },
          colSpan: 6
        },
        {
          prop: 'LIKE_name',
          label: $t('system.role.list.query.name'),
          component: 'Input',
          componentProps: {
            clearable: true,
            placeholder: $t('system.role.list.query.placeholder.name')
          },
          colSpan: 6
        },
        {
          prop: 'EQ_enabled',
          label: $t('system.role.list.query.enabled'),
          component: 'ApiDict',
          componentProps: {
            clearable: true,
            code: DictEnum.SYS_ENABLED_STATUS,
            placeholder: $t('system.role.list.query.placeholder.enabled'),
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
          label: $t('system.role.form.modal.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },

        // 角色名称
        {
          label: $t('system.role.form.modal.name'),
          prop: 'name',
          component: 'Input',
          colSpan: 24,
          rules: [
            {
              required: true,
              message: $t('system.role.form.modal.placeholder.name')
            }
          ],
          componentProps: {
            placeholder: $t('system.role.form.modal.placeholder.name'),
            clearable: true
          }
        },

        // 唯一编码
        {
          label: $t('system.role.form.modal.code'),
          prop: 'code',
          component: 'Input',
          colSpan: 24,
          rules: [
            {
              required: true,
              message: $t('system.role.form.modal.placeholder.code')
            }
          ],
          componentProps: {
            placeholder: $t('system.role.form.modal.placeholder.code'),
            clearable: true
          }
        },

        // 角色类型
        {
          label: $t('system.role.form.modal.role_type'),
          prop: 'role_type',
          component: 'ApiDict',
          colSpan: 24,
          componentProps: {
            placeholder: $t('system.role.form.modal.placeholder.role_type'),
            code: DictEnum.SYS_ROLE_TYPE,
            clearable: true
          }
        },

        // 是否启用
        {
          label: $t('system.role.form.modal.enabled'),
          prop: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 24,
          rules: [],
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true,
            renderType: 'RadioGroup'
          }
        },

        // 备注
        {
          label: $t('system.role.form.modal.remark'),
          prop: 'remark',
          component: 'Input',
          colSpan: 24,
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('system.role.form.modal.placeholder.remark')
          }
        }
      ]
    }
  }
}
