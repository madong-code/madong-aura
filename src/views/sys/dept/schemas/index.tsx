import { CrudSchema } from '@/components/crud'
import { DeptService } from '@/api/sys/dept'

// crud配置
export const crudSchema: CrudSchema = {
  // 接口地址：改为 tree 接口以支持树形结构
  api: DeptService.tree,
  dialogTitle: '部门管理',
  crudApi: {
    add: DeptService.save,
    edit: DeptService.update,
    remove: DeptService.remove,
    view: DeptService.detail
  },
  useCrud: true,
  hasAdd: true,
  hasRemove: true,
  hasEdit: true,
  hasView: true,
  addAuth: 'sys:dept:save',
  removeAuth: 'sys:dept:remove',
  editAuth: 'sys:dept:update',
  viewAuth: 'sys:dept:detail',

  // 禁用搜索表单，因为树形结构是全量数据
  useSearchForm: false,

  // 树形结构配置
  tree: {
    id: 'id',
    pid: 'parentId',
    children: 'children'
  },

  columns: [
    {
      type: 'selection'
    },
    {
      prop: 'name',
      label: '部门名称',
      component: 'Input'
    },
    {
      prop: 'code',
      label: '唯一编码',
      component: 'Input'
    },
    {
      prop: 'sort',
      label: '排序',
      component: 'InputNumber'
    },
    {
      prop: 'enabled',
      label: '状态',
      component: 'ApiDict',
      componentProps: {
        code: 'yes_no',
        renderType: 'RadioGroup'
      }
    },
    {
      prop: 'leaderIds',
      label: '负责人',
      component: 'ApiSelect',
      componentProps: {
        api: '/sys/user/select',
        labelField: 'realName',
        valueField: 'id',
        multiple: true
      }
    },
    {
      prop: 'mainLeaderId',
      label: '分管领导',
      component: 'ApiSelect',
      componentProps: {
        api: '/sys/user/select',
        labelField: 'realName',
        valueField: 'id'
      }
    }
  ],

  searchFormSchema: {
    schema: []
  },

  dialogProps: {
    width: '50%'
  },

  formSchema: {
    showDefaultActions: false,
    labelWidth: '100px',
    schema: [
      {
        label: '父级部门',
        prop: 'parentId',
        component: 'ApiTreeSelect',
        componentProps: {
          api: '/sys/dept/tree',
          labelField: 'name',
          valueField: 'id',
          clearable: true,
          placeholder: '请选择父级部门'
        },
        colSpan: 12,
        rules: [
          {
            required: true,
            message: '请选择父级部门'
          }
        ]
      },
      {
        label: '部门名称',
        prop: 'name',
        component: 'Input',
        componentProps: {
          placeholder: '请输入部门名称'
        },
        colSpan: 12,
        rules: [
          {
            required: true,
            message: '请输入部门名称'
          }
        ]
      },
      {
        label: '唯一编码',
        prop: 'code',
        component: 'Input',
        componentProps: {
          placeholder: '请输入唯一编码'
        },
        colSpan: 12,
        rules: [
          {
            required: true,
            message: '请输入唯一编码'
          }
        ]
      },
      {
        label: '排序',
        prop: 'sort',
        component: 'InputNumber',
        componentProps: {
          min: 0,
          max: 9999
        },
        colSpan: 12,
        rules: [
          {
            required: true,
            message: '请输入排序值'
          }
        ]
      },
      {
        label: '是否启用',
        prop: 'enabled',
        component: 'RadioGroup',
        componentProps: {
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 }
          ]
        },
        colSpan: 12,
        rules: [
          {
            required: true,
            message: '请选择启用状态'
          }
        ]
      },
      {
        label: '部门负责人',
        prop: 'leaderIds',
        component: 'ApiCheckboxGroup',
        componentProps: {
          api: '/sys/user/select',
          labelField: 'nickname',
          valueField: 'id',
          placeholder: '请选择负责人'
        },
        colSpan: 12
      },
      {
        label: '分管领导',
        prop: 'mainLeaderId',
        component: 'ApiSelect',
        componentProps: {
          api: '/sys/user/select',
          labelField: 'nickname',
          valueField: 'id',
          placeholder: '请选择分管领导'
        },
        colSpan: 12
      },
      {
        label: '备注',
        prop: 'remark',
        component: 'Input',
        componentProps: {
          type: 'textarea',
          rows: 3,
          placeholder: '请输入备注'
        },
        colSpan: 24
      }
    ]
  }
}
