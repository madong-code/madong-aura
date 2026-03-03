import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { DictEnum } from '@/enums'
import { Recordable } from '@/types'
import { Icon } from '@/components/icon'
import { GeneratorCodeService } from '@/api/tools/generator'


// crud配置 - 函数方式
export const crudSchema = (): CrudSchema => {
  return {
    rowKey: 'id',
    // 接口地址
    api: GeneratorCodeService.list,
    dialogTitle: $t('tools.generator.code.title'),
    crudApi: {
      // 新增接口
      add: GeneratorCodeService.create,
      // 修改接口
      edit: GeneratorCodeService.update,
      // 删除接口
      remove: GeneratorCodeService.remove,
      // 详情接口
      view: GeneratorCodeService.get
    },
    // 使用crud
    useCrud: true,
    // 是否有新增
    hasAdd: false,
    // 是否有删除
    hasRemove: true,
    // 是否有修改
    hasEdit: false,
    // 是否有详情
    hasView: false,
    // 新增权限码
    addAuth: 'generate:code:create',
    // 删除权限码
    removeAuth: 'generate:code:delete',
    // 修改权限码
    editAuth: 'generate:code:update',
    // 详情权限码
    viewAuth: 'generate:code:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'table_name',
        label: $t('tools.generator.code.list.table_name'),
        align: 'left',
        minWidth: 100
      },
      {
        prop: 'plugin_name',
        label: $t('tools.generator.code.list.plugin_name'),
        align: 'center',
        minWidth: 100,
        formatter: (row: Recordable) => {
          return row.plugin_name || '/';
        }
      },
      {
        prop: 'table_content',
        label: $t('tools.generator.code.list.table_content'),
      },
      {
        prop: 'created_date',
        align: 'left',
        label: $t('tools.generator.code.list.created_date')
      },
      {
        prop: 'updated_date',
        align: 'left',
        label: $t('tools.generator.code.list.updated_date')
      },
    ],

    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'ApiSelect',
          prop: 'EQ_featrues_name',
          label: $t('tools.generator.code.list.query.features_name'),
          componentProps: {
            // api: '/tools/code/features',
            placeholder: $t('tools.generator.code.list.query.placeholder_features_name'),
            clearable: true
          }
        },
        {
          component: 'Input',
          prop: 'LIKE_table_name',
          label: $t('tools.generator.code.list.query.table_name'),
          componentProps: {
            placeholder: $t('tools.generator.code.list.query.placeholder_table_name'),
            clearable: true
          }
        },
        // {
        //   component: 'Input',
        //   prop: 'LIKE_name',
        //   label: $t('tools.generator.code.list.query.name'),
        //   componentProps: {
        //     placeholder: $t('tools.generator.code.list.query.placeholder'),
        //     clearable: true
        //   }
        // },
      ],
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
            component: 'Input',
            ifShow: (values: any) => {
              return false;
            }
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
            },
            ifShow: (values: any) => {
              return false
            }
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
  }
}