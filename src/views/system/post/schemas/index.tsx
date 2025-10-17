import { CrudSchema } from '@/components/crud'
import { PostService } from '@/api/sys/post'

// crud配置
export const crudSchema: CrudSchema = {
  // 接口地址
  api: PostService.page,
  dialogTitle: '岗位',
  crudApi: {
    // 新增接口
    add: PostService.save,
    // 修改接口
    edit: PostService.update,
    // 删除接口
    remove: PostService.remove,
    // 详情接口
    view: PostService.detail
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
  addAuth: 'sys:post:save',
  // 删除权限码
  removeAuth: 'sys:post:remove',
  // 修改权限码
  editAuth: 'sys:post:update',
  // 详情权限码
  viewAuth: 'sys:post:detail',
  // 表格列定义
  columns: [
    {
      type: 'selection'
    },
    {
      prop: 'name',
      label: '岗位名称'
    },
    {
      prop: 'code',
      label: '唯一编码'
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
        code: 'yes_no'
      }
    },
    {
      prop: 'remark',
      label: '备注'
    }
  ],
  // 搜索表单定义
  searchFormSchema: {
    schema: [
      {
        prop: 'm_LIKE_name',
        label: '岗位名称',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入岗位名称'
        },
        colSpan: 6
      },
      {
        prop: 'm_EQ_enabled',
        label: '状态',
        component: 'ApiDict',
        componentProps: {
          code: 'yes_no',
          placeholder: '请选择状态'
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
        label: '岗位ID',
        prop: 'id',
        component: 'Input',
        colSpan: 24,
        show: false,
        ifDetail: false
      },
      {
        label: '岗位名称',
        prop: 'name',
        component: 'Input',
        rules: [
          {
            required: true,
            message: '请输入岗位名称'
          }
        ],
        componentProps: {
          placeholder: '请输入岗位名称'
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
        label: '排序',
        prop: 'sort',
        component: 'InputNumber',
        componentProps: {
          min: 0,
          placeholder: '请输入排序值'
        },
        colSpan: 24
      },
      {
        label: '是否启用',
        prop: 'enabled',
        component: 'ApiDict',
        componentProps: {
          code: 'yes_no',
          isBtn: true,
          renderType: 'RadioGroup'
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
        label: '备注',
        prop: 'remark',
        component: 'Input',
        componentProps: {
          type: 'textarea',
          placeholder: '请输入备注'
        },
        colSpan: 24
      }
    ]
  }
}
