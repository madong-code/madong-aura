import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { DictEnum } from '@/app/enums'
import { } from '@/app/api/setting/gateway'
import { OperateLogService } from '@/app/api/monitor/logs'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: OperateLogService.list,
    dialogTitle: $t('system.operate_logs.list.title'),
    crudApi: {
      // 新增接口
      add: OperateLogService.create,
      // 修改接口
      edit: OperateLogService.update,
      // 删除接口
      remove: OperateLogService.remove,
      // 详情接口
      view: OperateLogService.get
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
    addAuth: 'system:logs_operate:create',
    // 删除权限码
    removeAuth: 'system:logs_operate:delete',
    // 修改权限码
    editAuth: 'system:logs_operate:update',
    // 详情权限码
    viewAuth: 'system:logs_operate:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },

      {
        prop: 'name',
        label: $t('system.operate_logs.list.table.columns.name'),
        align: 'left',
        width: 90,

      },
      {
        prop: 'app',
        label: $t('system.operate_logs.list.table.columns.app'),
        width: 60
      },
      {
        prop: 'ip',
        label: $t('system.operate_logs.list.table.columns.ip'),
        width: 110
      },
      {
        prop: 'ip_location',
        label: $t('system.operate_logs.list.table.columns.ip_location')
      },
      {
        prop: 'os',
        label: $t('system.operate_logs.list.table.columns.os')
      },
      {
        prop: 'browser',
        label: $t('system.operate_logs.list.table.columns.browser')
      },
      {
        prop: 'url',
        label: $t('system.operate_logs.list.table.columns.url'),
        align: 'left',
        minWidth: 170
      },
      {
        prop: 'param',
        label: $t('system.operate_logs.list.table.columns.param'),
        minWidth: 170,
        formatter: (row: any) => {
          const jsonString = JSON.stringify(row.param, null, 2);
          return jsonString;
        }
      },
      {
        prop: 'created_date',
        label: $t('system.operate_logs.list.table.columns.created_date'),
        width: 170
      },
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_user_name',
          label: $t('system.operate_logs.list.query.user_name'),
          componentProps: {
            placeholder: $t('system.operate_logs.list.query.placeholder.user_name'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'LIKE_ip',
          label: $t('system.operate_logs.list.query.ip'),
          componentProps: {
            placeholder: $t('system.operate_logs.list.query.placeholder.ip'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'LIKE_url',
          label: $t('system.operate_logs.list.query.url'),
          componentProps: {
            placeholder: $t('system.operate_logs.list.query.placeholder.url'),
            clearable: true
          },
          colSpan: 6
        },
        {
          component: 'DatePicker',
          prop: 'BETWEEN_created_at',
          label: $t('system.operate_logs.list.query.created_date'),
          componentProps: {
            type: 'daterange'
          },
          colSpan: 6
        },
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
          prop: 'app',
          label: $t('system.operate_logs.form.app'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          }
        },
        {
          prop: 'ip',
          label: $t('system.operate_logs.form.ip'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'class_name',
          label: $t('system.operate_logs.form.class_name'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'method',
          label: $t('system.operate_logs.form.method'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'action',
          label: $t('system.operate_logs.form.action'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'created_date',
          label: $t('system.operate_logs.form.created_date'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'user_name',
          label: $t('system.operate_logs.form.user_name'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'param',
          label: $t('system.operate_logs.form.param'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            placeholder: '',
            readOnly: true,
            autoSize: { minRows: 3, maxRows: 5 }, // 自动高度
            style: {
              backgroundColor: '#f6f8fa',   // 浅灰背景
              border: '1px solid #e0e0e0',  // 边框颜色
              borderRadius: 4,
              fontFamily: 'monospace',       // 等宽字体
              cursor: 'text'                 // 保持文本光标
            }
          },
        },
        {
          prop: 'result',
          label: $t('system.operate_logs.form.result'),
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
