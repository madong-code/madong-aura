import { CrudSchema } from '@/components/crud'
import { MemberPointsService } from '@/api/member'
import { $t } from '@/locales'
import { R } from 'vue-router/dist/router-CWoNjPRp.mjs'
import { pa } from 'element-plus/es/locale'
import { DictEnum } from '@/enums'
import { formatDateTime } from '@/utils'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MemberPointsService.list,
    dialogTitle: $t('member.points.title'),
    crudApi: {
      // 新增接口
      add: MemberPointsService.create,
      // 修改接口
      edit: MemberPointsService.update,
      // 删除接口
      remove: MemberPointsService.remove,
      // 详情接口
      view: MemberPointsService.get
    },
    // 使用crud
    useCrud: true,
    // 是否有新增
    hasAdd: true,
    // 是否有删除
    hasRemove: false,
    // 是否有修改
    hasEdit: false,
    // 是否有详情
    hasView: true,
    // 新增权限码
    addAuth: 'member:points:operate',
    // 详情权限码
    viewAuth: 'member:points:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'id',
        label: $t('member.points.table.columns.id'),
        minWidth: 60,
        visible: false
      },
      {
        prop: 'member.username',
        label: $t('member.points.table.columns.username'),
        minWidth: 100
      },
      {
        prop: 'member.nickname',
        label: $t('member.points.table.columns.nickname'),
        minWidth: 100
      },
      {
        prop: 'type',
        label: $t('member.points.table.columns.type'),
        minWidth: 100,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.MEMBER_POINT_TYPE
        }
      },
      {
        prop: 'points',
        label: $t('member.points.table.columns.points'),
        minWidth: 100,
        formatter: (row: any) => {
          const prefix = row.type === 1 ? '+' : row.type === 2 ? '-' : ''
          return `${prefix}${row.points}`
        }
      },
      {
        prop: 'balance',
        label: $t('member.points.table.columns.balance'),
        minWidth: 120
      },
      {
        prop: 'source',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.MEMBER_POINT_SOURCE
        },
        label: $t('member.points.table.columns.source'),
        minWidth: 150,
        showOverflowTooltip: true
      },
      {
        prop: 'remark',
        label: $t('member.points.table.columns.remark'),
        minWidth: 200,
        showOverflowTooltip: true,
        visible: false
      },
      {
        prop: 'operator',
        label: $t('member.points.table.columns.operator'),
        minWidth: 100,
        visible: false
      },
      {
        prop: 'created_at',
        label: $t('member.points.table.columns.create_time'),
        minWidth: 160,
        formatter(row) {
          return formatDateTime(row.created_at)
        }
      }
    ],
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '100px',
      schema: [
        {
          prop: 'username',
          label: $t('member.points.search.username'),
          component: 'Input'
        },
        {
          prop: 'nickname',
          label: $t('member.points.search.nickname'),
          component: 'Input'
        },
        {
          prop: 'type',
          label: $t('member.points.search.type'),
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.MEMBER_POINT_TYPE,
            clearable: true
          }
        },
        {
          prop: 'date_range',
          label: $t('member.points.search.date_range'),
          component: 'DatePicker',
          componentProps: {
            type: 'daterange',
            'range-separator': '至',
            'start-placeholder': '开始日期',
            'end-placeholder': '结束日期'
          }
        }
      ]
    },
    // 表单配置
    formSchema: {
      labelWidth: 120,
      gutter: 20,
      schema: [
        {
          prop: 'member_id',
          label: $t('member.points.form.member_id'),
          component: 'ApiSelect',
          rules: [{ required: true, message: $t('member.points.form.rules_member_id') }],
          componentProps: {
            api: '/member/user',
            requestMethod: 'get',
            params: { format: 'select' }
          },
          colSpan: 24
        },
        {
          prop: 'type',
          label: $t('member.points.form.type'),
          component: 'ApiDict',
          rules: [{ required: true, message: $t('member.points.form.rules_type') }],
          componentProps: {
            code: DictEnum.MEMBER_POINT_TYPE
          },
          colSpan: 24
        },
        {
          prop: 'points',
          label: $t('member.points.form.points'),
          component: 'InputNumber',
          defaultValue: 0,
          rules: [{ required: true, message: $t('member.points.form.rules_points') }],
          componentProps: {
            min: 1,
            precision: 0
          },
          colSpan: 24
        },
        {
          prop: 'source',
          label: $t('member.points.form.source'),
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.MEMBER_POINT_SOURCE
          },
          rules: [{ required: true, message: $t('member.points.form.rules_source') }],
          colSpan: 24
        },
        {
          prop: 'remark',
          label: $t('member.points.form.remark'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 3
          },
          colSpan: 24
        }
      ]
    },
    dialogProps: {
      width: '40%'
    }
  }
}
