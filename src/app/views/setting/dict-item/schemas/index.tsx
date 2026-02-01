import { CrudSchema } from '@/components/crud'
import { DictItemService } from '@/app/api/setting/dict'
import { $t } from '@/locales'
import { DictEnum } from '@/app/enums'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    api: DictItemService.list,
    dialogTitle: '字典项管理',
    crudApi: {
      add: DictItemService.create,
      edit: DictItemService.update,
      remove: DictItemService.remove,
      view: DictItemService.get
    },
    useCrud: true,
    hasAdd: true,
    hasRemove: true,
    hasEdit: true,
    hasView: true,
    addAuth: 'system:dict-item:create',
    removeAuth: 'system:dict-item:delete',
    editAuth: 'system:dict-item:update',
    viewAuth: 'system:dict-item:read',
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'code',
        label: $t('system.dict_item.list.table.columns.code'),
        minWidth: 150
      },
      {
        prop: 'label',
        label: $t('system.dict_item.list.table.columns.label')
      },
      {
        prop: 'value',
        label: $t('system.dict_item.list.table.columns.value')
      },
      {
        prop: 'sort',
        label: $t('system.dict_item.list.table.columns.sort')
      },
      {
        prop: 'enabled',
        label: $t('system.dict_item.list.table.columns.enabled'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS,
          renderType: 'RadioGroup'
        }
      }
    ],
    searchFormSchema: {
      schema: [
        {
          prop: 'LIKE_label',
          labelWidth: '90px',
          label: $t('system.dict_item.list.query.label'),
          component: 'Input',
          componentProps: {
            clearable: true,
            placeholder: $t('system.dict_item.list.query.placeholder.label')
          },
          colSpan: 8
        },
        {
          prop: 'LIKE_value',
          label: $t('system.dict_item.list.query.value'),
          component: 'Input',
          componentProps: {
            clearable: true,
            placeholder: $t('system.dict_item.list.query.placeholder.value')
          },
          colSpan: 8
        }
      ]
    },
    dialogProps: {
      width: '50%'
    },
    formSchema: {
      showDefaultActions: false,
      labelWidth: '100px',
      schema: [
        {
          label: $t('system.dict_item.form.modal.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          label: $t('system.dict_item.form.modal.id'),
          prop: 'dict_id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          label: $t('system.dict_item.form.modal.code'),
          prop: 'code',
          component: 'Input',
          componentProps: {
            disabled: true
          },
          rules: [],
          colSpan: 24
        },

        {
          component: 'Input',
          prop: 'color',
          label: $t('system.dict_item.form.modal.color')
        },
        {
          prop: 'label',
          label: $t('system.dict_item.form.modal.label'),
          component: 'Input',
          componentProps: {
            placeholder: $t('system.dict_item.form.modal.placeholder.label'),
            allowClear: true
          },
          rules: []
        },
        {
          prop: 'value',
          label: $t('system.dict_item.form.modal.value'),
          component: 'Input',
          componentProps: {
            placeholder: $t('system.dict_item.form.modal.placeholder.value'),
            allowClear: true
          },
          colSpan: 24,
          rules: []
        },
        {
          prop: 'other_class',
          label: $t('system.dict_item.form.modal.other_class'),
          component: 'Input',
          componentProps: {
            placeholder: $t('system.dict_item.form.modal.placeholder.other_class')
          }
        },
        {
          prop: 'enabled',
          label: $t('system.dict_item.form.modal.enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            renderType: 'RadioGroup',
            isBtn: true
          }
        },
        {
          prop: 'sort',
          label: $t('system.dict_item.form.modal.sort'),
          component: 'InputNumber',
          defaultValue: 0,
          componentProps: {
            placeholder: $t('system.dict_item.form.modal.placeholder.sort'),
            allowClear: true,
            min: 0
          },
          colSpan: 24
        },
        {
          prop: 'remark',
          label: $t('system.dict_item.form.modal.remark'),
          component: 'Textarea',
          componentProps: {
            placeholder: $t('system.dict_item.form.modal.placeholder.remark'),
            type: 'textarea',
            rows: 4
          },
          colSpan: 24
        }
      ]
    }
  }
}
