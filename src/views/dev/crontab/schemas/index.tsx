import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { DictEnum } from '@/enums'
import { Recordable } from '@/types'
import { Icon } from '@/components/icon'
import { CrontabService } from '@/api/dev/crontab'

// crud配置
export const crudSchema: CrudSchema = {
  // 接口地址
  api: CrontabService.list,
  dialogTitle: '定时任务',
  crudApi: {
    // 新增接口
    add: CrontabService.create,
    // 修改接口
    edit: CrontabService.update,
    // 删除接口
    remove: CrontabService.remove,
    // 详情接口
    view: CrontabService.get
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
  addAuth: 'dev:crontab:create',
  // 删除权限码
  removeAuth: 'dev:crontab:delete',
  // 修改权限码
  editAuth: 'dev:crontab:edit',
  // 详情权限码
  viewAuth: 'dev:crontab:detail',
  // 表格列定义
  columns: [
    {
      type: 'selection'
    },
    {
      prop: 'title',
      label: $t('dev.crontab.list.table.columns.title'),
      align: 'left',
      minWidth: 150
    },
    {
      prop: 'rule',
      label: $t('dev.crontab.list.table.columns.rule'),
      align: 'left',
      minWidth: 100
    },
    {
      prop: 'singleton',
      label: $t('dev.crontab.list.table.columns.singleton'),
      component: 'ApiDict',
      componentProps: {
        code: DictEnum.SYS_MONITOR_CRONTAB_MODE,
        typeMap: {
          1: 'success',
          0: 'danger'
        },
        useColorList: false
      }
    },
    {
      prop: 'rule_name',
      align: 'left',
      label: $t('dev.crontab.list.table.columns.rule_name')
    },
    {
      prop: 'target',
      label: $t('dev.crontab.list.table.columns.target'),
      align: 'left',
      minWidth: 170
    },
    {
      prop: 'enabled',
      label: $t('dev.crontab.list.table.columns.enabled'),
      component: 'ApiDict',
      componentProps: {
        code: DictEnum.SYS_ENABLED_STATUS
      }
    },
    {
      prop: 'running_times',
      label: $t('dev.crontab.list.table.columns.running_times'),
      align: 'left'
    },
    {
      prop: 'last_running_time',
      label: $t('dev.crontab.list.table.columns.last_running_time'),
      width: 170
    }
  ],

  // 搜索表单定义
  searchFormSchema: {
    labelWidth: '200px',
    schema: [
      {
        component: 'Input',
        prop: 'LIKE_title',
        label: $t('dev.crontab.list.query.title'),
        componentProps: {
          placeholder: $t('dev.crontab.list.query.placeholder.title'),
          clearable: true
        }
      },
      {
        component: 'ApiDict',
        prop: 'EQ_type',
        label: $t('dev.crontab.list.query.type'),
        componentProps: {
          placeholder: $t('dev.crontab.list.query.placeholder.type'),
          clearable: true,
          code: DictEnum.SYS_MONITOR_CRONTAB_TYPE
        }
      },
      {
        component: 'ApiDict',
        prop: 'EQ_enabled',
        label: $t('dev.crontab.list.query.enabled'),
        componentProps: {
          placeholder: $t('dev.crontab.list.query.placeholder.enabled'),
          code: DictEnum.SYS_ENABLED_STATUS,
          clearable: true
        }
      }
    ]
  },

  // 内置弹窗配置
  dialogProps: {
    width: '60%',
    dialogType: 'drawer'
  },
  // crud表单配置
  formSchema: {
    showDefaultActions: false,
    labelWidth: '130px',
    gutter: 24,
    schema: [
      {
        prop: 'id',
        label: $t('dev.crontab.form.modal.id'),
        component: 'Input'
        // ifShow: false
      },
      {
        prop: 'title',
        label: $t('dev.crontab.form.modal.title'),
        component: 'Input',
        componentProps: {
          placeholder: $t('dev.crontab.form.modal.placeholder.title'),
          clearable: true
        },
        rules: [{ required: true, message: $t('dev.crontab.form.modal.placeholder.title') }]
      },
      {
        prop: 'type',
        label: $t('dev.crontab.form.modal.type'),
        component: 'ApiDict',
        defaultValue: 1,
        componentProps: {
          placeholder: $t('dev.crontab.form.modal.type'),
          code: DictEnum.SYS_MONITOR_CRONTAB_TYPE
        },
        rules: [{ required: true }]
      },
      {
        prop: 'rule',
        label: $t('dev.crontab.form.modal.rule'),
        component: 'Input',
        componentProps: {
          placeholder: $t('dev.crontab.form.modal.placeholder.rule'),
          clearable: true,
          disabled: (values: any) => {
            return values.id !== undefined && values.id !== '' && values.id !== null
          }
        }
        // ifShow: (values: any) => {
        //   return false
        // }
      },
      {
        prop: 'task_cycle',
        label: $t('dev.crontab.form.modal.task_cycle'),
        component: 'ApiDict',
        defaultValue: 1,
        componentProps: {
          placeholder: $t('dev.crontab.form.modal.placeholder.task_cycle'),
          code: DictEnum.SYS_MONITOR_CRONTAB_CYCLE
        },
        rules: [{ required: true }],
        colSpan: 8
      },
      {
        prop: 'month',
        label: '',
        labelWidth: '0px',
        component: 'Input',
        ifShow: (values: any) => {
          return [5].includes(values.task_cycle)
        },
        componentProps: {
          type: 'number',
          min: 1,
          max: 12,
          suffixIcon: (values: any) => {
            return $t('dev.crontab.form.modal.suffix.month')
          }
        },
        colSpan: 4
      },
      {
        prop: 'day',
        label: '',
        labelWidth: '0px',
        component: 'Input',
        ifShow: (values: any) => {
          //年份月份的时候显示
          return [4, 5].includes(values.task_cycle)
        },
        componentProps: {
          type: 'number',
          min: 1,
          max: 31,
          suffixIcon: (values: any) => {
            return $t('dev.crontab.form.modal.suffix.day') //日
          }
        },
        colSpan: 4
      },
      {
        prop: 'week',
        label: '',
        labelWidth: 1,
        component: 'ApiDict',
        ifShow: (values) => {
          //每星期的时候显示周选项
          return [3].includes(values.task_cycle)
        },
        componentProps: {
          clearable: true,
          code: DictEnum.SYS_MONITOR_CRONTAB_WEEK,
          placeholder: '',
          suffixIcon: (values: any) => {
            return $t('dev.crontab.form.modal.suffix.day') //日
          }
        },
        colSpan: 4
      },
      {
        prop: 'hour',
        label: '',
        labelWidth: '0px',
        component: 'Input',
        ifShow: (values) => {
          //每星期的时候显示周选项
          return [1, 3, 4, 6, 5].includes(values.task_cycle)
        },
        componentProps: {
          type: 'number',
          suffixIcon: () => $t('dev.crontab.form.modal.suffix.hour'), //时
          min: 1,
          max: 23
        },
        colSpan: 4
      },
      {
        prop: 'minute',
        label: '',
        labelWidth: '0px',
        component: 'Input',
        ifShow: (values: any) => {
          return [1, 2, 3, 4, 6, 7, 5].includes(values.task_cycle)
        },
        componentProps: {
          type: 'number',
          min: 0,
          max: 59,
          suffixIcon: () => $t('dev.crontab.form.modal.suffix.minute') //分
        },
        colSpan: 4
      },
      {
        prop: 'second',
        label: '',
        labelWidth: '0px',
        component: 'Input',
        ifShow: (values: any) => {
          return [8].includes(values.task_cycle)
        },
        componentProps: {
          type: 'number',
          min: 0,
          max: 59,
          suffixIcon: () => $t('dev.crontab.form.modal.suffix.second') //秒
        },
        colSpan: 4
      },
      {
        prop: 'target',
        label: $t('dev.crontab.form.modal.target'),
        component: 'Input',
        componentProps: {
          type: 'textarea',
          placeholder: $t('dev.crontab.form.modal.placeholder.target'),
          rows: 4,
          clearable: true
        },
        rules: [{ required: true, message: $t('dev.crontab.form.modal.placeholder.target') }],
        colSpan: 24
      },
      {
        prop: 'singleton',
        label: $t('dev.crontab.form.modal.singleton'),
        component: 'ApiDict',
        defaultValue: 1,
        componentProps: {
          renderType: 'RadioGroup',
          code: DictEnum.SYS_MONITOR_CRONTAB_MODE,
          isBtn: true
        },
        rules: [{ required: true }]
      },
      {
        prop: 'enabled',
        label: $t('dev.crontab.form.modal.enabled'),
        component: 'ApiDict',
        defaultValue: 1,
        componentProps: {
          renderType: 'RadioGroup',
          code: DictEnum.SYS_ENABLED_STATUS,
          isBtn: true
        },
        rules: [{ required: true }]
      },
      {
        prop: 'remark',
        label: $t('dev.crontab.form.modal.remark'),
        component: 'Input',
        componentProps: {
          type: 'textarea',
          placeholder: $t('dev.crontab.form.modal.placeholder.remark'),
          rows: 5
        },
        ifShow: false //暂不显示
      }
    ]
  }
}
