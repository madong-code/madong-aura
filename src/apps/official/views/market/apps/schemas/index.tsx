import { MarketAppService } from '@/apps/official/api/market'
import { DictEnum } from '@/apps/official/enums/dict-enum'
import { CrudSchema } from '@/components/crud'
import { formatDateTime } from '@/utils'


// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MarketAppService.list,
    dialogTitle: '应用列表',
    crudApi: {
      // 新增接口
      add: MarketAppService.create,
      // 修改接口
      edit: MarketAppService.update,
      // 删除接口
      remove: MarketAppService.remove,
      // 详情接口
      view: MarketAppService.get
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
    addAuth: 'market:apps:create',
    // 删除权限码
    removeAuth: 'market:apps:delete',
    // 修改权限码
    editAuth: 'market:apps:update',
    // 详情权限码
    viewAuth: 'market:apps:read',
    rowKey: 'id',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },

      {
        prop: 'category.name',
        label: '类型',
        align: 'center',
        minWidth: 120
      },
      {
        prop: 'code',
        label: '应用标识',
        align: 'left',
        minWidth: 120
      },
      {
        prop: 'name',
        label: '应用名称',
        align: 'left',
        minWidth: 120
      },
      {
        prop: 'description',
        label: '应用描述',
        align: 'left',
        minWidth: 200
      },
      {
        prop: 'sort_weight',
        label: '排序',
        width: 70,
        align: 'center'
      },
      {
        prop: 'developer',
        label: '开发者',
        align: 'center',
        minWidth: 100
      },
      {
        prop: 'version',
        label: '活动版本',
        align: 'center',
        width: 90
      },
      {
        label: '是否上架',
        prop: 'status',
        align: 'center',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_YES_NO
        }
      },

      {
        label: '创建时间',
        prop: 'created_at',
        minWidth: 170,
        align: 'center',
        visible: false,
        formatter: (row: any) => {
          return formatDateTime(row.created_at)
        }
      },
      {
        label: '更新时间',
        prop: 'updated_at',
        minWidth: 170,
        align: 'center',
        visible: false,
        formatter: (row: any) => {
          return formatDateTime(row.updated_at)
        }
      }
    ],
    // 内置弹窗配置
    dialogProps: {
      width: '70%',
    },
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '120px',
      schema: [
        {
          label: '应用标识',
          prop: 'LIKE_code',
          component: 'Input',
          colSpan: 6,
          rules: [],
        },
        {
          label: '应用名称',
          prop: 'LIKE_name',
          component: 'Input',
          colSpan: 6,
          rules: [],
        },
        {
          label: '应用描述',
          prop: 'LIKE_description',
          component: 'Input',
          colSpan: 6,
          rules: [],
        },
        {
          label: '商家名称',
          prop: 'LIKE_developer',
          component: 'Input',
          colSpan: 6,
          rules: [],
        },
        {
          prop: 'EQ_enabled',
          label: '状态',
          component: 'ApiDict',
          componentProps: {
            clearable: true,
            code: DictEnum.SYS_ENABLED_STATUS
          },
          colSpan: 6
        },
        {
          label: '应用类型',
          prop: 'EQ_category_id',
          component: 'ApiSelect',
          componentProps: {
            clearable: true,
            api: '/market/category',
            params: {
              format: 'select'
            },
            colSpan: 6,
            rules: [],
          }
        }
      ]
    },
    // crud表单配置
    formSchema: {
      labelWidth: 120,
      gutter: 20,
      schema: []
    }
  }
}
