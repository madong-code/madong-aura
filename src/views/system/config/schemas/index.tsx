import { CrudSchema } from '@/components/crud'
import { ConfigService } from '@/api/system/config'

// crud配置
export const crudSchema: CrudSchema = {
  api: ConfigService.list,
  dialogTitle: '参数配置',
  crudApi: {
    add: ConfigService.create,
    edit: ConfigService.update,
    remove: ConfigService.remove,
    view: ConfigService.detail
  },
  useCrud: true,
  hasAdd: true,
  hasRemove: true,
  hasEdit: true,
  hasView: true,
  addAuth: 'sys:config:save',
  removeAuth: 'sys:config:remove',
  editAuth: 'sys:config:update',
  viewAuth: 'sys:config:detail',
  columns: [
    {
      type: 'selection'
    },
    {
      prop: 'groupCode',
      label: '分组编码',
      component: 'ApiDict',
      minWidth: 200,
      componentProps: {
        clearable: true,
        code: 'sys_config_group_code'
      }
    },
    {
      prop: 'name',
      label: '配置名称',
      minWidth: 200,
      component: 'Input',
      componentProps: {
        clearable: true
      }
    },
    {
      prop: 'code',
      label: '唯一编码',
      minWidth: 120,
      component: 'Input',
      componentProps: {
        clearable: true
      }
    },
    {
      prop: 'content',
      label: '参数值',
      minWidth: 200,
      component: 'Input',
      showOverflowTooltip: true,
      componentProps: {}
    },
    {
      prop: 'isSys',
      label: '是否系统',
      minWidth: 80,
      component: 'ApiDict',
      componentProps: {
        code: 'yes_no'
      }
    },
    {
      prop: 'enabled',
      label: '是否启用',
      minWidth: 80,
      component: 'ApiDict',
      componentProps: {
        code: 'yes_no'
      }
    },
    {
      prop: 'remark',
      label: '备注',
      minWidth: 80,
      component: 'Input',
      componentProps: {
        clearable: true
      },
      showOverflowTooltip: true
    }
  ],
  searchFormSchema: {
    schema: [
      {
        prop: 'm_IN_groupCode',
        label: '所属分组',
        component: 'ApiDict',
        componentProps: {
          clearable: true,
          placeholder: '请输入所属分组',
          multiple: true,
          code: 'sys_config_group_code'
        },
        colSpan: 6
      },
      {
        prop: 'm_LIKE_name',
        label: '配置名称',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入配置名称'
        },
        colSpan: 6
      },
      {
        prop: 'm_LIKE_code',
        label: '唯一编码',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入唯一编码'
        },
        colSpan: 6
      },
      {
        prop: 'm_EQ_isSys',
        label: '是否系统',
        component: 'ApiDict',
        componentProps: {
          code: 'yes_no',
          renderType: 'Select'
        },
        colSpan: 6
      },
      {
        prop: 'm_EQ_enabled',
        label: '是否启用',
        component: 'ApiDict',
        componentProps: {
          code: 'yes_no',
          renderType: 'Select'
        },
        colSpan: 6
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
        label: '配置ID',
        prop: 'id',
        component: 'Input',
        colSpan: 24,
        show: false,
        ifDetail: false
      },
      {
        label: '所属分组',
        prop: 'groupCode',
        component: 'ApiDict',
        componentProps: {
          clearable: true,
          code: 'sys_config_group_code',
          placeholder: '请选择所属分组'
        },
        colSpan: 24,
        rules: [
          {
            required: true,
            message: '请选择所属分组'
          }
        ]
      },
      {
        label: '配置名称',
        prop: 'name',
        component: 'Input',
        rules: [
          {
            required: true,
            message: '请输入配置名称'
          }
        ],
        componentProps: {
          clearable: true,
          placeholder: '请输入配置名称'
        },
        colSpan: 24
      },
      {
        label: '唯一编码',
        prop: 'code',
        component: 'Input',
        rules: [
          {
            required: true,
            message: '请输入唯一编码'
          }
        ],
        componentProps: {
          clearable: true,
          placeholder: '请输入唯一编码'
        },
        colSpan: 24
      },

      {
        label: '参数值',
        prop: 'content',
        component: 'Input',
        rules: [
          {
            required: true,
            message: '请输入参数值'
          }
        ],
        componentProps: {
          clearable: true,
          placeholder: '请输入参数值'
        },
        colSpan: 24
      },
      {
        label: '是否系统',
        prop: 'isSys',
        component: 'ApiDict',
        defaultValue: 1,
        componentProps: {
          code: 'yes_no',
          renderType: 'RadioGroup',
          isBtn: true
        },
        colSpan: 24,
        rules: [{ required: true, message: '请选择是否系统' }]
      },
      {
        label: '是否启用',
        prop: 'enabled',
        defaultValue: 1,
        component: 'ApiDict',
        componentProps: {
          code: 'yes_no',
          renderType: 'RadioGroup',
          isBtn: true
        },
        colSpan: 24,
        rules: [{ required: true, message: '请选择是否启用' }]
      },
      {
        label: '备注',
        prop: 'remark',
        component: 'Input',
        componentProps: {
          clearable: true,
          type: 'textarea',
          rows: 3,
          placeholder: '请输入备注'
        },
        colSpan: 24
      }
    ]
  }
}
