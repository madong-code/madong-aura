import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { DictEnum } from '@/app/enums'
import { Recordable } from '@/types'
import { Icon } from '@/components/icon'
import { GatewayBlacklistService } from '@/app/api/setting/gateway'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { formatISODate } from '@/utils/tools/format'

// 初始化 dayjs 插件
dayjs.extend(utc)
dayjs.extend(timezone)

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: GatewayBlacklistService.list,
    dialogTitle: $t('setting.gateway.blacklist.list.title'),
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
    addAuth: 'gateway:blacklist:create',
    // 删除权限码
    removeAuth: 'gateway:blacklist:delete',
    // 修改权限码
    editAuth: 'gateway:blacklist:update',
    // 详情权限码
    viewAuth: 'gateway:blacklist:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'priority',
        label: $t('setting.gateway.blacklist.list.table.columns.priority'),
        width: 80,
      },
      {
        prop: 'name',
        label: $t('setting.gateway.blacklist.list.table.columns.name'),
        align: 'left',
        minWidth: 150
      },
      {
        prop: 'ip',
        label: $t('setting.gateway.blacklist.list.table.columns.ip'),
        align: 'left',
        minWidth: 150
      },
      {
        prop: 'match_type',
        label: $t('setting.gateway.blacklist.list.table.columns.match_type'),
        width: 120,
      },
      {
        prop: 'methods',
        label: $t('setting.gateway.blacklist.list.table.columns.methods'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_REQUEST_MODE
        },
        minWidth: 90
      },
      {
        prop: 'path',
        label: $t('setting.gateway.blacklist.list.table.columns.path'),
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
        label: $t('setting.gateway.blacklist.list.table.columns.start_date'),
        align: 'left',
        minWidth: 180,
        formatter: (row: any) => {
          if (!row.start_date) return '-';
          // 处理时间戳格式
          const dateValue = typeof row.start_date === 'number' ? new Date(row.start_date * 1000) : row.start_date;
          return formatISODate(dateValue);
        }
      },
      {
        prop: 'end_date',
        label: $t('setting.gateway.blacklist.list.table.columns.end_date'),
        align: 'left',
        minWidth: 180,
        formatter: (row: any) => {
          if (!row.end_date) return '-';
          // 处理时间戳格式
          const dateValue = typeof row.end_date === 'number' ? new Date(row.end_date * 1000) : row.end_date;
          return formatISODate(dateValue);
        }
      },
      {
        prop: 'created_at',
        label: $t('setting.gateway.blacklist.list.table.columns.created_date'),
        align: 'left',
        minWidth: 180,
        formatter: (row: any) => {
          if (!row.created_at) return '-';
          // 处理时间戳格式
          const dateValue = typeof row.created_at === 'number' ? new Date(row.created_at * 1000) : row.created_at;
          return formatISODate(dateValue);
        }
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_name',
          label: $t('setting.gateway.blacklist.list.query.name'),
          componentProps: {
            placeholder: $t('setting.gateway.blacklist.list.query.placeholder.name'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'LIKE_ip',
          label: $t('setting.gateway.blacklist.list.query.ip'),
          componentProps: {
            placeholder: $t('setting.gateway.blacklist.list.query.placeholder.ip'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'path',
          label: $t('setting.gateway.blacklist.list.query.path'),
          componentProps: {
            placeholder: $t('setting.gateway.blacklist.list.query.placeholder.path'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'ApiDict',
          prop: 'EQ_enabled',
          label: $t('setting.gateway.blacklist.list.query.enabled'),
          componentProps: {
            placeholder: $t('setting.gateway.blacklist.list.query.placeholder.enabled'),
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
          label: $t('setting.gateway.blacklist.form.modal.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 12,
          show: false,
          ifDetail: false
        },
        {
          prop: 'name',
          label: $t('setting.gateway.blacklist.form.modal.name'),
          component: 'Input',
          componentProps: {
            placeholder: $t('setting.gateway.blacklist.form.modal.placeholder.name'),
            clearable: true
          },
          rules: [{ required: true, message: $t('setting.gateway.blacklist.form.modal.placeholder.name') }]
        },
        {
          prop: 'match_type',
          label: $t('setting.gateway.blacklist.form.modal.match_type'),
          component: 'Select',
          defaultValue: 'exact',
          componentProps: {
            placeholder: $t('setting.gateway.blacklist.form.modal.placeholder.match_type'),
            clearable: true,
            options: [
              { label: '精确匹配', value: 'exact' },
              { label: '通配符匹配', value: 'wildcard' },
              { label: '正则表达式匹配', value: 'regex' }
            ]
          },
          rules: [{ required: true, message: $t('setting.gateway.blacklist.form.modal.placeholder.match_type') }]
        },
        {
          prop: 'priority',
          label: $t('setting.gateway.blacklist.form.modal.priority'),
          component: 'Input',
          defaultValue: 100,
          componentProps: {
            type: 'number',
            placeholder: $t('setting.gateway.blacklist.form.modal.placeholder.priority'),
            clearable: true
          },
          rules: [{ required: true, message: $t('setting.gateway.blacklist.form.modal.placeholder.priority') }]
        },
        {
          prop: 'ip',
          label: $t('setting.gateway.blacklist.form.modal.ip'),
          component: 'Input',
          componentProps: {
            placeholder: '留空表示不限 IP',
            clearable: true
          },
          rules: []
        },
        {
          prop: 'methods',
          label: $t('setting.gateway.blacklist.form.modal.methods'),
          component: 'ApiDict',
          componentProps: {
            placeholder: $t('setting.gateway.blacklist.form.modal.methods'),
            code: DictEnum.SYS_REQUEST_MODE
          },
          rules: [{ required: true, message: $t('setting.gateway.blacklist.form.modal.methods') }]
        },
        {
          prop: 'path',
          label: $t('setting.gateway.blacklist.form.modal.path'),
          component: 'Input',
          componentProps: {
            placeholder: $t('setting.gateway.blacklist.form.modal.placeholder.path'),
            clearable: true
          },
          rules: [{ required: true, message: '' }]
        },
        {
          prop: 'start_date',
          label: $t('setting.gateway.blacklist.form.modal.start_time'),
          component: 'DatePicker',
          componentProps: {
            type: 'datetime',
            placeholder: $t('setting.gateway.blacklist.form.modal.placeholder.start_time'),
            clearable: true,
            format: 'YYYY-MM-DD HH:mm:ss',
            valueFormat: 'YYYY-MM-DD HH:mm:ss'
          }
        },
        {
          prop: 'end_date',
          label: $t('setting.gateway.blacklist.form.modal.end_time'),
          component: 'DatePicker',
          componentProps: {
            type: 'datetime',
            placeholder: $t('setting.gateway.blacklist.form.modal.placeholder.end_time'),
            clearable: true,
            format: 'YYYY-MM-DD HH:mm:ss',
            valueFormat: 'YYYY-MM-DD HH:mm:ss'
          }
        },
        {
          prop: 'enabled',
          label: $t('setting.gateway.blacklist.form.modal.enabled'),
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
          label: $t('setting.gateway.blacklist.form.modal.message'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('setting.gateway.blacklist.form.modal.placeholder.message')
          }
        },
        {
          prop: 'remark',
          label: $t('setting.gateway.blacklist.form.modal.remark'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('setting.gateway.blacklist.form.modal.placeholder.remark')
          }
        }
      ]
    }
  }
}
