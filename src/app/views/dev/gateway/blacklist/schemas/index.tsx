import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { DictEnum } from '@/app/enums'
import { Recordable } from '@/types'
import { Icon } from '@/components/icon'
import { GatewayBlacklistService } from '@/app/api/dev/gateway'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: GatewayBlacklistService.list,
    dialogTitle: $t('dev.blacklist.list.title'),
    crudApi: {
      // 新增接口
      add: GatewayBlacklistService.create,
      // 修改接口
      edit: GatewayBlacklistService.update,
      // 删除接口
      remove: GatewayBlacklistService.remove,
      // 详情接口
      view: GatewayBlacklistService.get
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
    addAuth: 'dev:blacklist:create',
    // 删除权限码
    removeAuth: 'dev:blacklist:delete',
    // 修改权限码
    editAuth: 'dev:blacklist:update',
    // 详情权限码
    viewAuth: 'dev:blacklist:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      // {
      //   prop: 'priority',
      //   label: $t('dev.blacklist.list.table.columns.priority'),
      //   width: 60,
      // },
      {
        prop: 'name',
        label: $t('dev.blacklist.list.table.columns.name'),
        align: 'left',
        minWidth: 150
      },
      {
        prop: 'ip',
        label: $t('dev.blacklist.list.table.columns.ip'),
        align: 'left',
        minWidth: 150
      },
      // {
      //   prop: 'match_type',
      //   label: $t('dev.blacklist.list.table.columns.match_type'),
      //   width: 110,
      // },
      {
        prop: 'methods',
        label: $t('dev.blacklist.list.table.columns.methods'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_REQUEST_MODE
        },
        minWidth: 90
      },
      {
        prop: 'path',
        label: $t('dev.blacklist.list.table.columns.path'),
        align: 'left',
        minWidth: 100
      },
      {
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        },
        prop: 'enabled',
        label: $t('system.user.list.table.columns.enabled'),
        width: 100
      },

      {
        prop: 'start_date',
        label: $t('dev.blacklist.list.table.columns.start_date'),
        align: 'left',
        minWidth: 100
      },
      {
        prop: 'end_date',
        label: $t('dev.blacklist.list.table.columns.end_date'),
        align: 'left',
        minWidth: 100
      },
      {
        prop: 'created_date',
        label: $t('dev.blacklist.list.table.columns.created_date'),
        align: 'left',
        minWidth: 100
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_name',
          label: $t('dev.blacklist.list.query.name'),
          componentProps: {
            placeholder: $t('dev.blacklist.list.query.placeholder.name'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'LIKE_ip',
          label: $t('dev.blacklist.list.query.ip'),
          componentProps: {
            placeholder: $t('dev.blacklist.list.query.placeholder.ip'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'path',
          label: $t('dev.blacklist.list.query.path'),
          componentProps: {
            placeholder: $t('dev.blacklist.list.query.placeholder.path'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'ApiDict',
          prop: 'EQ_enabled',
          label: $t('dev.blacklist.list.query.enabled'),
          componentProps: {
            placeholder: $t('dev.blacklist.list.query.placeholder.enabled'),
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true
          },
          colSpan: 6
        }
      ]
    },
    // 内置弹窗配置
    dialogProps: {
      width: '50%'
    },
    // crud表单配置
    formSchema: {
      showDefaultActions: false,
      labelWidth: '100px',
      schema: [
        {
          label: $t('dev.blacklist.form.modal.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 12,
          show: false,
          ifDetail: false
        },
        {
          prop: 'name',
          label: $t('dev.blacklist.form.modal.name'),
          component: 'Input',
          componentProps: {
            placeholder: $t('dev.blacklist.form.modal.placeholder.name'),
            clearable: true
          },
          rules: [{ required: true, message: $t('dev.blacklist.form.modal.placeholder.name') }]
        },
        {
          prop: 'match_type',
          label: $t('dev.blacklist.form.modal.match_type'),
          component: 'Select',
          defaultValue: 1,
          componentProps: {
            placeholder: $t('dev.blacklist.form.modal.placeholder.match_type'),
            clearable: true,
            options: [
              { label: 'ip', value: 1 },
              { label: '全局', value: 0 }
            ]
          },
          rules: [{ required: true, message: $t('dev.blacklist.form.modal.placeholder.match_type') }]
        },
        {
          prop: 'ip',
          label: $t('dev.blacklist.form.modal.ip'),
          component: 'Input',
          componentProps: {
            placeholder: $t('dev.blacklist.form.modal.placeholder.ip'),
            clearable: true
          },
          rules: [{ required: true, message: $t('dev.blacklist.form.modal.placeholder.ip') }]
        },
        {
          prop: 'methods',
          label: $t('dev.blacklist.form.modal.methods'),
          component: 'ApiDict',
          componentProps: {
            placeholder: $t('dev.blacklist.form.modal.methods'),
            code: DictEnum.SYS_REQUEST_MODE
          },
          rules: [{ required: true, message: $t('dev.blacklist.form.modal.methods') }]
        },
        {
          prop: 'path',
          label: $t('dev.blacklist.form.modal.path'),
          component: 'Input',
          componentProps: {
            placeholder: $t('dev.blacklist.form.modal.placeholder.path'),
            clearable: true
          },
          rules: [{ required: true, message: '' }]
        },
        {
          prop: 'enabled',
          label: $t('dev.blacklist.form.modal.enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            renderType: 'RadioGroup',
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true
          }
        },
        {
          prop: 'message',
          label: $t('dev.blacklist.form.modal.message'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('dev.blacklist.form.modal.placeholder.message')
          }
        }
      ]
    }
  }
}
