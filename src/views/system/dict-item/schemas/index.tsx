import { CrudSchema } from '@/components/crud'
import { DictItemService } from '@/api/sys/dict-item'

// crud配置
export const crudSchema: CrudSchema = {
  api: DictItemService.page,
  dialogTitle: '字典项管理',
  crudApi: {
    add: DictItemService.save,
    edit: DictItemService.update,
    remove: DictItemService.remove,
    view: DictItemService.detail
  },
  useCrud: true,
  hasAdd: true,
  hasRemove: true,
  hasEdit: true,
  hasView: true,
  addAuth: 'sys:dict-item:save',
  removeAuth: 'sys:dict-item:remove',
  editAuth: 'sys:dict-item:update',
  viewAuth: 'sys:dict-item:detail',
  columns: [
    {
      type: 'selection'
    },
    {
      prop: 'name',
      label: '字典项名称'
    },
    {
      prop: 'code',
      label: '字典值'
    },
    {
      prop: 'sort',
      label: '排序'
    },
    {
      prop: 'enabled',
      label: '是否启用',
      component: 'ApiDict',
      componentProps: {
        code: 'yes_no',
        renderType: 'RadioGroup'
      }
    }
  ],
  searchFormSchema: {
    schema: [
      {
        prop: 'm_LIKE_name',
        labelWidth: '90px',
        label: '字典项名称',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入字典项名称'
        },
        colSpan: 8
      },
      {
        prop: 'm_LIKE_code',
        label: '字典值',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入字典值'
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
        label: '字典项ID',
        prop: 'id',
        component: 'Input',
        colSpan: 24,
        show: false,
        ifDetail: false
      },
      {
        label: '字典项名称',
        prop: 'name',
        component: 'Input',
        rules: [
          {
            required: true,
            message: '请输入字典项名称'
          }
        ],
        colSpan: 24
      },
      {
        label: '字典值',
        prop: 'code',
        component: 'Input',
        rules: [
          {
            required: true,
            message: '请输入唯一编码'
          }
        ],
        colSpan: 24
      },
      {
        label: '是否启用',
        prop: 'enabled',
        component: 'ApiDict',
        defaultValue: 1,
        componentProps: {
          code: 'yes_no',
          renderType: 'RadioGroup',
          isBtn: true
        },
        rules: [
          {
            required: true,
            message: '请选择是否启用'
          }
        ],
        colSpan: 24
      },
      {
        label: '排序',
        prop: 'sort',
        component: 'InputNumber',
        componentProps: {
          min: 0
        },
        colSpan: 24
      },
      {
        label: '备注',
        prop: 'remark',
        component: 'Input',
        componentProps: {
          type: 'textarea',
          rows: 3
        },
        colSpan: 24
      }
    ]
  }
}
