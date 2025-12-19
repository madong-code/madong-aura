import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { DictEnum } from '@/enums'
import { } from '@/api/dev/gateway'
import { LoginLogService } from '@/api/system/logs'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: LoginLogService.list,
    dialogTitle: $t('system.login_logs.list.title'),
    crudApi: {
      // 新增接口
      add: LoginLogService.create,
      // 修改接口
      edit: LoginLogService.update,
      // 删除接口
      remove: LoginLogService.remove,
      // 详情接口
      view: LoginLogService.get
    },
    // 使用crud
    useCrud: true,
    // 是否有新增
    hasAdd: true,
    // 是否有删除
    hasRemove: true,
    // 是否有修改
    hasEdit: false,
    // 是否有详情
    hasView: true,
    // 新增权限码
    addAuth: 'system:logs_login:create',
    // 删除权限码
    removeAuth: 'system:logs_login:delete',
    // 修改权限码
    editAuth: 'system:logs_login:update',
    // 详情权限码
    viewAuth: 'system:logs_login:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },

      {
        prop: 'user_name',
        label: $t('system.login_logs.list.table.columns.user_name')
      },
      {
        prop: 'status',
        label: $t('system.login_logs.list.table.columns.status'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_OPERATION_RESULT
        }
      },
      {
        prop: 'os',
        label: $t('system.login_logs.list.table.columns.os')
      },
      {
        prop: 'browser',
        label: $t('system.login_logs.list.table.columns.browser')
      },
      {
        prop: 'ip',
        label: $t('system.login_logs.list.table.columns.ip')
      },
      {
        prop: 'ip_location',
        label: $t('system.login_logs.list.table.columns.ip_location')
      },
      {
        prop: 'created_date',
        label: $t('system.login_logs.list.table.columns.login_date'),
        width: 170
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_user_name',
          label: $t('system.login_logs.list.query.user_name'),
          componentProps: {
            placeholder: $t('system.login_logs.list.query.placeholder.user_name'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'LIKE_ip',
          label: $t('system.login_logs.list.query.ip'),
          componentProps: {
            placeholder: $t('system.login_logs.list.query.placeholder.ip'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'ApiDict',
          prop: 'status',
          label: $t('system.login_logs.list.query.status'),
          componentProps: {
            placeholder: $t('system.login_logs.list.query.placeholder.status'),
            clearable: true,
            code: DictEnum.SYS_OPERATION_RESULT
          },
          colSpan: 6
        },
        {
          component: 'DatePicker',
          prop: 'BETWEEN_created_at',
          label: $t('system.login_logs.list.query.created_date'),
          colSpan: 6,
          componentProps: {
            type: 'daterange'
          }
        }
      ]
    },
    // 内置弹窗配置
    dialogProps: {
      width: '50%'
    },
    // crud表单配置
    formSchema: {
      schema: [
        {
          prop: 'id',
          label: 'ID',
          component: 'Input',
          ifShow: false,
          ifDetail: false,
        },
        {
          prop: 'user_name',
          label: $t('system.login_logs.list.table.columns.user_name'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          }
        },
        {
          prop: 'status',
          label: $t('system.login_logs.list.table.columns.status'),
          component: 'ApiDict',
          componentProps: {
            placeholder: '',
            code: DictEnum.SYS_OPERATION_RESULT
          },
        },
        {
          prop: 'os',
          label: $t('system.login_logs.list.table.columns.os'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'browser',
          label: $t('system.login_logs.list.table.columns.browser'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'ip',
          label: $t('system.login_logs.list.table.columns.ip'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'ip_location',
          label: $t('system.login_logs.list.table.columns.ip_location'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'created_date',
          label: $t('system.login_logs.list.table.columns.login_date'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'remark',
          label: $t('system.login_logs.list.table.columns.remark'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            placeholder: '',
            readOnly: true,
            autosize: { minRows: 8, maxRows: 15 }, // 自动高度
            style: {
              backgroundColor: '#f6f8fa',   // 浅灰背景
              border: '1px solid #e0e0e0',  // 边框颜色
              borderRadius: 4,
              fontFamily: 'monospace',       // 等宽字体
              cursor: 'text'                 // 保持文本光标
            }
          },
        }
      ]

    }
  }
}
