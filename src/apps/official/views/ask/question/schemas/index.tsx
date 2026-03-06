import { QuestionService } from '@/apps/official/api/ask'
import { DictEnum } from '@/apps/official/enums/dict-enum'
import { CrudSchema } from '@/components/crud'
import { formatDateTime } from '@/utils'
import { h } from 'vue'
import { ElTag } from 'element-plus'


// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: QuestionService.list,
    dialogTitle: '问题列表',
    crudApi: {
      // 删除接口
      remove: QuestionService.remove,
      // 详情接口
      view: QuestionService.get
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
    addAuth: 'ask:question:create',
    // 删除权限码
    removeAuth: 'ask:question:delete',
    // 修改权限码
    editAuth: 'ask:question:update',
    // 详情权限码
    viewAuth: 'ask:question:read',
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
        prop: 'category.name',
        label: '分类',
        align: 'center',
        minWidth: 100,
        formatter: (row: any) => {
          return row.category?.name || '/'
        }
      },
      {
        prop: 'title',
        label: '问题标题',
        align: 'left',
        minWidth: 200
      },
      {
        prop: 'content',
        label: '问题内容',
        align: 'left',
        minWidth: 300,
        visible: false,
        showOverflowTooltip: true
      },
      {
        label: '标签',
        prop: 'tags',
        align: 'left',
        minWidth: 150,
        formatter: (row: any) => {
          if (!row.tags || !Array.isArray(row.tags) || row.tags.length === 0) {
            return '-'
          }
          return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-start' } },
            row.tags.map((t: any) =>
              h(ElTag, { size: 'small', key: t.id }, () => t.name)
            )
          )
        }
      },
      {
        prop: 'view_count',
        label: '浏览',
        align: 'center',
        width: 70
      },
      {
        prop: 'comment_count',
        label: '评论',
        align: 'center',
        width: 70
      },
      {
        prop: 'like_count',
        label: '收藏',
        align: 'center',
        width: 70
      },
      {
        label: '是否置顶',
        prop: 'is_sticky',
        align: 'center',
        width: 90,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_YES_NO
        }
      },
        {
        label: '是否精华',
        prop: 'is_excellent',
        align: 'center',
        width: 90,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_YES_NO
        }
      },
            {
        prop: 'member.nickname',
        label: '提问者',
        align: 'center',
        minWidth: 100
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
      }
    ],
    // 内置弹窗配置
    dialogProps: {
      width: '70%',
    },
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '100px',
      schema: [
        {
          label: '关键词',
          prop: 'keywords',
          component: 'Input',
          colSpan: 6,
          componentProps: {
            placeholder: '标题/内容'
          }
        },
        {
          label: '分类',
          prop: 'EQ_category_id',
          component: 'ApiSelect',
          componentProps: {
            clearable: true,
            api: '/ask/category',
            params: {
              format: 'select'
            },
          },
          colSpan: 6
        },
        {
          label: '是否置顶',
          prop: 'EQ_is_sticky',
          component: 'ApiDict',
          componentProps: {
            clearable: true,
            code: DictEnum.SYS_YES_NO
          },
          colSpan: 6
        },
        {
          label: '是否精华',
          prop: 'EQ_is_excellent',  
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
      labelWidth: 120,
      gutter: 20,
      schema: []
    }
  }
}
