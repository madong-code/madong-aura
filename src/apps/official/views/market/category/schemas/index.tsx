import { MarketCategoryService } from '@/apps/official/api/market'
import { DictEnum } from '@/apps/official/enums/dict-enum'
import { CrudSchema } from '@/components/crud'
import { formatDateTime } from '@/utils'


// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MarketCategoryService.list,
    dialogTitle: '应用分类',
    crudApi: {
      // 新增接口
      add: MarketCategoryService.create,
      // 修改接口
      edit: MarketCategoryService.update,
      // 删除接口
      remove: MarketCategoryService.remove,
      // 详情接口
      view: MarketCategoryService.get
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
    hasView: false,
    // 新增权限码
    addAuth: 'market:category:create',
    // 删除权限码
    removeAuth: 'market:category:delete',
    // 修改权限码
    editAuth: 'market:category:update',
    // 详情权限码
    viewAuth: 'market:category:read',
    rowKey: 'id',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      
      {
        prop: 'name',
        label: '名称',
        align: 'left',
        minWidth: 120
      },
      {
        label: '状态',
        prop: 'enabled',
        align: 'center',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        }
      },
      {
        prop: 'sort',
        label: '排序',
        width: 70,
        align: 'center'
      },
      {
        label: '创建时间',
        prop: 'created_at',
        minWidth: 150,
        align: 'center',
        formatter: (row: any) => {
          return formatDateTime(row.created_at)
        }
      },
      {
        label: '更新时间',
        prop: 'updated_at',
        align: 'center',
        visible: false,
        formatter: (row: any) => {
          return formatDateTime(row.updated_at)
        }
      }
    ],
    // 内置弹窗配置
    dialogProps: {
      width: '50%',
    },
    // 搜索表单配置
      searchFormSchema: {
      labelWidth: '120px',
      schema: [
        {
          label: '名称',
          prop: 'LIKE_name',
          component: 'Input',
          colSpan: 6,
          rules: [],
        },
        {
          prop: 'EQ_enabled',
          label: '状态',
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS
          },
          colSpan: 6
        }
      ]
    },
    // crud表单配置
    formSchema: {
      labelWidth: 120,
      gutter: 20,
      schema: [
        {
          label: '名称',
          prop: 'name',
          component: 'Input',
          rules: [
            {
              required: true,
              message: '请输入名称',
              trigger: 'blur'
            }
          ],
           componentProps: () => ({
            clearable: true,
            placeholder: '请输入名称',
            style:{
              width: '50%'
            }
          })
        },
        {
          label: '排序',
          prop: 'sort',
          component: 'InputNumber',
          defaultValue: 0,
          componentProps: {
            min: 0,
            max: 9999,
            controlsPosition: 'right'
          },
          rules: [
            {
              required: true,
              message: '请输入排序',
              trigger: 'blur'
            }
          ]
        }
      ]

    }
  }
}
