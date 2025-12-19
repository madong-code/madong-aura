import { $t } from '@/locales'
import { DictEnum } from '@/enums'
import { CrudSchema } from '@/components/crud'
import { GatewayLimiterService } from '@/api/dev/gateway'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: GatewayLimiterService.list,
    dialogTitle: $t('dev.limiter.list.title'),
    crudApi: {
      // 新增接口
      add: GatewayLimiterService.create,
      // 修改接口
      edit: GatewayLimiterService.update,
      // 删除接口
      remove: GatewayLimiterService.remove,
      // 详情接口
      view: GatewayLimiterService.get
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
    addAuth: 'dev:limiter:create',
    // 删除权限码
    removeAuth: 'dev:limiter:delete',
    // 修改权限码
    editAuth: 'dev:limiter:update',
    // 详情权限码
    viewAuth: 'dev:limiter:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'priority',
        label: $t('dev.limiter.list.table.columns.priority'),
        width: 60
      },
      {
        prop: 'name',
        label: $t('dev.limiter.list.table.columns.name'),
        align: 'left',
        minWidth: 150
      },
      {
        prop: 'match_type',
        label: $t('dev.limiter.list.table.columns.match_type'),
        width: 110
      },
      {
        prop: 'methods',
        label: $t('dev.limiter.list.table.columns.methods'),
        componentProps: {
          code: DictEnum.SYS_REQUEST_MODE
        },
        minWidth: 90
      },
      {
        prop: 'path',
        label: $t('dev.limiter.list.table.columns.path'),
        align: 'left',
        minWidth: 100
      },
      {
        prop: 'enabled',
        label: $t('system.user.list.table.columns.enabled'),
        width: 100,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        }
      },

      {
        prop: 'limit_type',
        label: $t('dev.limiter.list.table.columns.limit_type')
      },
      {
        prop: 'limit_value',
        label: $t('dev.limiter.list.table.columns.limit_value')
      },
      {
        prop: 'period',
        label: $t('dev.limiter.list.table.columns.period'),
        width: 110
      },
      {
        prop: 'ttl',
        label: $t('dev.limiter.list.table.columns.ttl')
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_name',
          label: $t('dev.limiter.list.query.name'),
          componentProps: {
            placeholder: $t('dev.limiter.list.query.placeholder.name'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'path',
          label: $t('dev.limiter.list.query.path'),
          componentProps: {
            placeholder: $t('dev.limiter.list.query.placeholder.path'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'ApiDict',
          prop: 'enabled',
          label: $t('dev.limiter.list.query.enabled'),
          componentProps: {
            placeholder: $t('dev.limiter.list.query.placeholder.enabled'),
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
      labelWidth: '120px',
      schema: [
        {
          prop: 'name',
          label: $t('dev.limiter.form.modal.name'),
          component: 'Input',
          componentProps: {
            placeholder: $t('dev.limiter.form.modal.placeholder.name'),
            clearable: true
          },
          rules: []
        },
        {
          prop: 'match_type',
          label: $t('dev.limiter.form.modal.match_type'),
          component: 'Select',
          defaultValue: 1,
          componentProps: {
            placeholder: $t('dev.limiter.form.modal.placeholder.match_type'),
            clearable: true,
            options: [
              { label: 'ip', value: 1 },
              { label: '全局', value: 0 }
            ]
          },
          rules: [{ required: true, message: $t('dev.limiter.form.modal.placeholder.match_type') }]
        },
        {
          prop: 'methods',
          label: $t('dev.limiter.form.modal.methods'),
          component: 'ApiDict',
          componentProps: {
            placeholder: $t('dev.limiter.form.modal.methods'),
            code: DictEnum.SYS_REQUEST_MODE
          },
          rules: []
        },
        {
          prop: 'path',
          label: $t('dev.limiter.form.modal.path'),
          component: 'Input',
          componentProps: {
            placeholder: $t('dev.limiter.form.modal.placeholder.path'),
            clearable: true
          },
          rules: []
        },
        {
          prop: 'limit_value',
          label: $t('dev.limiter.form.modal.limit_value'),
          component: 'Input',
          componentProps: {
            type: 'number',
            placeholder: $t('dev.limiter.form.modal.placeholder.limit_value')
          },
          rules: [{ required: true, message: $t('dev.limiter.form.modal.placeholder.limit_value') }]
        },
        {
          prop: 'period',
          defaultValue: 1,
          label: $t('dev.limiter.form.modal.period'),
          component: 'Input',
          componentProps: {
            min: 1,
            max: 60,
            type: 'number',
            placeholder: $t('dev.limiter.form.modal.placeholder.period')
          },
          rules: []
        },
        {
          prop: 'enabled',
          label: $t('dev.limiter.form.modal.enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            renderType: 'RadioGroup',
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true
          },
          rules: []
        },
        {
          prop: 'message',
          label: $t('dev.limiter.form.modal.message'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('dev.limiter.form.modal.placeholder.message')
          }
        }
      ]
    }
  }
}
