import { DocContentService } from '@/apps/official/api/doc'
import { DictEnum } from '@/apps/official/enums/dict-enum'
import { CrudSchema } from '@/components/crud'
import { formatDateTime } from '@/utils'

const route = useRoute()
const router = useRouter()
const getRouteParams = () => {
  // 优先使用路径参数
  if (route.params.id) {
    return route.params.id as string
  }
  // 其次使用查询参数
  if (route.query.id) {
    return route.query.id as string
  }
  // 还可以支持其他查询参数名称
  if (route.query.doc_id) {
    return route.query.doc_id as string
  }
  return null
}

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: DocContentService.list,
    dialogTitle: '文档中心',
    crudApi: {
      // 新增接口
      add: DocContentService.create,
      // 修改接口
      edit: DocContentService.update,
      // 删除接口
      remove: DocContentService.remove,
      // 详情接口
      view: DocContentService.get
    },
    tree: {
      // 树形id字段名
      id: 'id',
      // 树形pid字段名
      pid: 'pid',
      // 树形children字段名
      children: 'children'
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
    addAuth: 'official:doc-item:create',
    // 删除权限码
    removeAuth: 'official:doc-item:delete',
    // 修改权限码
    editAuth: 'official:doc-item:update',
    // 详情权限码
    viewAuth: 'official:doc-item:read',
    rowKey: 'id',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        label: '类型',
        prop: 'type',
        width: 90,
        align: 'center',
        formatter: (row: any) => {
          return Number(row.type) === 1 ? '目录' : '文档'
        }
      },
      {
        prop: 'title',
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
        label: '访问权限',
        prop: 'is_auth',
        align: 'center',
        formatter: (row: any) => {
          return Number(row.is_auth) === 1 ? '继承权限' : '公开文档'
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
      width: '70%',
      dialogType: 'drawer'
    },
    // 搜索表单配置
    useSearchForm: false,
    // crud表单配置
    formSchema: {}
  }
}
