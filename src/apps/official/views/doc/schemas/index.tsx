import { DocProjectService } from '@/apps/official/api/doc'
import { DictEnum } from '@/apps/official/enums/dict-enum'
import { CrudSchema } from '@/components/crud'
import { h } from 'vue'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: DocProjectService.list,
    dialogTitle: '文档中心',
    crudApi: {
      // 新增接口
      add: DocProjectService.create,
      // 修改接口
      edit: DocProjectService.update,
      // 删除接口
      remove: DocProjectService.remove,
      // 详情接口
      view: DocProjectService.get
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
    addAuth: 'official:doc:create',
    // 删除权限码
    removeAuth: 'official:doc:delete',
    // 修改权限码
    editAuth: 'official:doc:update',
    // 详情权限码
    viewAuth: 'official:doc:read',
    rowKey: 'id',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        label: '排序',
        prop: 'sort',
        align: 'center'
      },
      {
        prop: 'thumb',
        label: '缩略图',
        align: 'center',
        width: 80,
        useSlot: true
      },
      {
        label: '唯一标识',
        prop: 'code',
        align: 'center'
      },
      {
        label: '标题',
        prop: 'title',
        align: 'center'
      },
      {
        label: '阅读量',
        prop: 'sort',
        align: 'center'
      },
      {
        prop: 'is_show',
        label: '是否显示',
        align: 'center',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_YES_NO
        }
      },
      {
        prop: 'enabled',
        label: '状态',
        align: 'center',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        }
      }
    ],
    // 内置弹窗配置
    dialogProps: {
      width: '70%',
      dialogType: 'drawer'
    },
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '120px',
      schema: [
        {
          label: '唯一标识',
          prop: 'code',
          component: 'Input',
          colSpan: 6,
          rules: []
        },
        {
          prop: 'LIKE_title',
          label: '标题',
          component: 'Input',
          colSpan: 6
        }
      ]
    }
    // crud表单配置
  }
}
