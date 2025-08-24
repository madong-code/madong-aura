import { CrudSchema } from '@/components/crud'
import { DictService } from '@/api/sys/dict'

// crud配置
export const crudSchema: CrudSchema = {
  // 接口地址
  api: DictService.page,
  dialogTitle: '字典',
  crudApi: {
    // 新增接口
    add: DictService.save,
    // 修改接口
    edit: DictService.update,
    // 删除接口
    remove: DictService.remove,
    // 详情接口
    view: DictService.detail
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
  addAuth: 'sys:dict:save',
  // 删除权限码
  removeAuth: 'sys:dict:remove',
  // 修改权限码
  editAuth: 'sys:dict:update',
  // 详情权限码
  viewAuth: 'sys:dict:detail',
  // 表格列定义
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
        code: 'sys_dict_group_code'
      }
    },
    {
      prop: 'name',
      label: '字典名称',
      minWidth: 200
    },
    {
      prop: 'code',
      label: '唯一编码',
      minWidth: 200
    },
    {
      prop: 'dataType',
      label: '数据类型',
      component: 'ApiDict',
      componentProps: {
        code: 'sys_dict_data_type'
      },
      minWidth: 100
    },
    {
      prop: 'sort',
      label: '排序',
      minWidth: 100
    },
    {
      prop: 'enabled',
      label: '是否启用',
      component: 'ApiDict',
      componentProps: {
        code: 'yes_no'
      },
      minWidth: 100
    }
  ],
  // 搜索表单定义
  searchFormSchema: {
    schema: [
      {
        label: '所属分组',
        prop: 'm_IN_groupCode',
        component: 'ApiDict',
        componentProps: {
          code: 'sys_dict_group_code',
          clearable: true,
          placeholder: '请选择所属分组',
          multiple: true
        },
        colSpan: 6
      },
      {
        prop: 'm_LIKE_name',
        label: '字典名称',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入字典名称'
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
        label: '是否启用',
        prop: 'm_IN_enabled',
        component: 'ApiDict',
        componentProps: {
          code: 'yes_no',
          clearable: true,
          placeholder: '请选择是否启用'
        },
        colSpan: 6
      }
    ]
  },
  // 内置弹窗配置
  dialogProps: {
    width: '40%'
  },
  // crud表单配置
  formSchema: {
    showDefaultActions: false,
    labelWidth: '100px',
    schema: [
      {
        label: '菜单ID',
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
          code: 'sys_dict_group_code'
        },
        rules: [
          {
            required: true,
            message: '请选择所属分组'
          }
        ],
        colSpan: 24
      },
      {
        label: '字典名称',
        prop: 'name',
        component: 'Input',
        rules: [
          {
            required: true,
            message: '请输入字典名称'
          }
        ],
        componentProps: {
          placeholder: '请输入字典名称'
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
          placeholder: '请输入唯一编码'
        },
        colSpan: 24
      },

      {
        label: '数据类型',
        prop: 'dataType',
        component: 'ApiDict',
        defaultValue: 1,
        componentProps: {
          code: 'sys_dict_data_type',
          renderType: 'RadioGroup',
          isBtn: true,
          placeholder: '请选择数据类型'
        },
        rules: [
          {
            required: true,
            message: '请选择数据类型'
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
        componentProps: {},
        colSpan: 24
      },
      {
        label: '备注',
        prop: 'remark',
        component: 'Input',
        componentProps: {
          type: 'textarea',
          rows: 4,
          placeholder: '请输入备注'
        },
        colSpan: 24
      }
    ]
  }
}
