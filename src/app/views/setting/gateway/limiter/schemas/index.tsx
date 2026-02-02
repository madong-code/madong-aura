import { $t } from '@/locales'
import { DictEnum } from '@/app/enums'
import { CrudSchema } from '@/components/crud'
import { GatewayLimiterService } from '@/app/api/setting/gateway'
import { formatISODate } from '@/utils/tools/format'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: GatewayLimiterService.list,
    dialogTitle: $t('setting.gateway.limiter.list.title'),
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
    addAuth: 'gateway:limiter:create',
    // 删除权限码
    removeAuth: 'gateway:limiter:delete',
    // 修改权限码
    editAuth: 'gateway:limiter:update',
    // 详情权限码
    viewAuth: 'gateway:limiter:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'priority',
        label: $t('setting.gateway.limiter.list.table.columns.priority'),
        width: 60
      },
      {
        prop: 'name',
        label: $t('setting.gateway.limiter.list.table.columns.name'),
        align: 'left',
        minWidth: 150
      },
      {
        prop: 'match_type',
        label: $t('setting.gateway.limiter.list.table.columns.match_type'),
        width: 110
      },
      {
        prop: 'methods',
        label: $t('setting.gateway.limiter.list.table.columns.methods'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_REQUEST_MODE
        },
        minWidth: 90
      },
      {
        prop: 'path',
        label: $t('setting.gateway.limiter.list.table.columns.path'),
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
        label: $t('setting.gateway.limiter.list.table.columns.limit_type')
      },
      {
        prop: 'limit_value',
        label: $t('setting.gateway.limiter.list.table.columns.limit_value')
      },
      {
        prop: 'period',
        label: $t('setting.gateway.limiter.list.table.columns.period'),
        width: 110
      },
      {
        prop: 'ttl',
        label: $t('setting.gateway.limiter.list.table.columns.ttl')
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_name',
          label: $t('setting.gateway.limiter.list.query.name'),
          componentProps: {
            placeholder: $t('setting.gateway.limiter.list.query.placeholder.name'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'path',
          label: $t('setting.gateway.limiter.list.query.path'),
          componentProps: {
            placeholder: $t('setting.gateway.limiter.list.query.placeholder.path'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'ApiDict',
          prop: 'enabled',
          label: $t('setting.gateway.limiter.list.query.enabled'),
          componentProps: {
            placeholder: $t('setting.gateway.limiter.list.query.placeholder.enabled'),
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
          label: $t('setting.gateway.limiter.form.modal.name'),
          component: 'Input',
          componentProps: {
            placeholder: $t('setting.gateway.limiter.form.modal.placeholder.name'),
            clearable: true
          },
          rules: []
        },
        {
          prop: 'match_type',
          label: $t('setting.gateway.limiter.form.modal.match_type'),
          component: 'Select',
          defaultValue: 'exact',
          componentProps: {
            placeholder: $t('setting.gateway.limiter.form.modal.placeholder.match_type'),
            clearable: true,
            options: [
              { label: '精确匹配', value: 'exact' },
              { label: '通配符匹配', value: 'wildcard' },
              { label: '正则表达式匹配', value: 'regex' }
            ]
          },
          rules: [{ required: true, message: $t('setting.gateway.limiter.form.modal.placeholder.match_type') }]
        },
        {
          prop: 'limit_type',
          label: $t('setting.gateway.limiter.form.modal.limit_type'),
          component: 'Select',
          defaultValue: 'ip',
          componentProps: {
            placeholder: $t('setting.gateway.limiter.form.modal.placeholder.limit_type'),
            clearable: true,
            options: [
              { label: 'IP限流', value: 'ip' },
              { label: '用户限流', value: 'user' }
            ]
          },
          rules: [{ required: true, message: $t('setting.gateway.limiter.form.modal.placeholder.limit_type') }]
        },
        {
          prop: 'methods',
          label: $t('setting.gateway.limiter.form.modal.methods'),
          component: 'ApiDict',
          componentProps: {
            placeholder: $t('setting.gateway.limiter.form.modal.methods'),
            code: DictEnum.SYS_REQUEST_MODE
          },
          rules: []
        },
        {
          prop: 'path',
          label: $t('setting.gateway.limiter.form.modal.path'),
          component: 'Input',
          componentProps: {
            placeholder: $t('setting.gateway.limiter.form.modal.placeholder.path'),
            clearable: true
          },
          rules: []
        },
        {
          prop: 'limit_value',
          label: $t('setting.gateway.limiter.form.modal.limit_value'),
          component: 'Input',
          componentProps: {
            type: 'number',
            placeholder: $t('setting.gateway.limiter.form.modal.placeholder.limit_value')
          },
          rules: [{ required: true, message: $t('setting.gateway.limiter.form.modal.placeholder.limit_value') }]
        },
        {
          prop: 'period',
          defaultValue: 1,
          label: $t('setting.gateway.limiter.form.modal.period'),
          component: 'Input',
          componentProps: {
            min: 1,
            max: 60,
            type: 'number',
            placeholder: $t('setting.gateway.limiter.form.modal.placeholder.period')
          },
          rules: []
        },
        {
          prop: 'ttl',
          label: $t('setting.gateway.limiter.form.modal.ttl'),
          component: 'Input',
          defaultValue: 60,
          componentProps: {
            type: 'number',
            placeholder: $t('setting.gateway.limiter.form.modal.placeholder.ttl')
          },
          rules: [{ required: true, message: $t('setting.gateway.limiter.form.modal.placeholder.ttl') }]
        },
        {
          prop: 'enabled',
          label: $t('setting.gateway.limiter.form.modal.enabled'),
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
          label: $t('setting.gateway.limiter.form.modal.message'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('setting.gateway.limiter.form.modal.placeholder.message')
          }
        }
      ]
    }
  }
}
