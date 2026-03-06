import { CategoryService } from '@/apps/official/api/ask'
import { DictEnum } from '@/apps/official/enums/dict-enum'
import { CrudSchema } from '@/components/crud'
import { formatDateTime } from '@/utils'


// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: CategoryService.list,
    dialogTitle: '分类列表',
    crudApi: {
      // 新增接口
      add: CategoryService.create,
      // 修改接口
      edit: CategoryService.update,
      // 删除接口
      remove: CategoryService.remove,
      // 详情接口
      view: CategoryService.get
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
    addAuth: 'ask:category:create',
    // 删除权限码
    removeAuth: 'ask:category:delete',
    // 修改权限码
    editAuth: 'ask:category:update',
    // 详情权限码
    viewAuth: 'ask:category:read',
    rowKey: 'id',
    
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'id',
        label: 'ID',
        align: 'center',
        width: 80,
        visible: false
      },
      {
        prop: 'name',
        label: '分类名称',
        align: 'left',
        minWidth: 150
      },
      {
        prop: 'description',
        label: '分类描述',
        align: 'left',
        minWidth: 150
      },
      {
        prop: 'sort',
        label: '排序',
        align: 'center',
        width: 80
      },
      {
        label: '状态',
        prop: 'status',
        align: 'center',
        width: 80,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        }
      },
      {
        label: '创建时间',
        prop: 'created_at',
        minWidth: 170,
        align: 'center',
        formatter: (row: any) => {
          return formatDateTime(row.created_at)
        }
      }
    ],
    // 内置弹窗配置
    dialogProps: {
      width: '50%',
    },
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '100px',
      schema: [
        {
          label: '分类名称',
          prop: 'LIKE_name',
          component: 'Input',
          colSpan: 6,
        },
        {
          label: '状态',
          prop: 'EQ_status',
          component: 'ApiDict',
          componentProps: {
            clearable: true,
            code: DictEnum.SYS_YES_NO
          },
          colSpan: 6
        }
      ]
    },
    // crud表单配置
    formSchema: {
      labelWidth: 100,
      gutter: 20,
      schema: [
        {
          label: 'ID',
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false
        },
        {
          label: '分类名称',
          prop: 'name',
          component: 'Input',
          colSpan: 24,
          rules: [{ required: true, message: '请输入分类名称' }]
        },
        {
          label: '分类描述',
          prop: 'description',
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 3
          },
          colSpan: 24
        },
        {
          label: '排序',
          prop: 'sort',
          component: 'InputNumber',
          defaultValue: 0,
          componentProps: {
            min: 0,
            max: 9999
          },
          colSpan: 12
        },
        {
          label: '状态',
          prop: 'status',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 12,
          componentProps: {
            isBtn: true,
            code: DictEnum.SYS_YES_NO,
            renderType: 'RadioGroup'
          }
        }
      ]
    }
  }
}
