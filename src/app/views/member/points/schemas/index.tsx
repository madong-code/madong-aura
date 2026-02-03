import { CrudSchema } from '@/components/crud'
import { MemberPointsService } from '@/app/api/member'
import { $t } from '@/locales'

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
        minWidth: 60
      },
      {
        prop: 'username',
        label: $t('member.points.table.columns.username'),
        minWidth: 100
      },
      {
        prop: 'nickname',
        label: $t('member.points.table.columns.nickname'),
        minWidth: 100
      },
      {
        prop: 'type',
        label: $t('member.points.table.columns.type'),
        minWidth: 100,
        cellRender: {
          name: 'CellTag',
          props: {
            type: (row: any) => (row.type === 1 ? 'success' : row.type === 2 ? 'danger' : 'info'),
            value: (row: any) =>
              row.type === 1
                ? $t('member.points.types.earn')
                : row.type === 2
                  ? $t('member.points.types.consume')
                  : $t('member.points.types.adjust')
          }
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
        prop: 'points_after',
        label: $t('member.points.table.columns.points_after'),
        minWidth: 120
      },
      {
        prop: 'source',
        label: $t('member.points.table.columns.source'),
        minWidth: 150,
        showOverflowTooltip: true
      },
      {
        prop: 'remark',
        label: $t('member.points.table.columns.remark'),
        minWidth: 200,
        showOverflowTooltip: true
      },
      {
        prop: 'operator',
        label: $t('member.points.table.columns.operator'),
        minWidth: 100
      },
      {
        prop: 'create_time',
        label: $t('member.points.table.columns.create_time'),
        minWidth: 160
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
          component: 'Select',
          componentProps: {
            options: [
              { label: $t('member.points.types.earn'), value: 1 },
              { label: $t('member.points.types.consume'), value: 2 },
              { label: $t('member.points.types.adjust'), value: 3 }
            ],
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
          component: 'Select',
          rules: [{ required: true, message: $t('member.points.form.rules_member_id') }],
          componentProps: {
            api: '/api/member/user/list',
            props: {
              label: 'username',
              value: 'id'
            }
          },
          colSpan: 24
        },
        {
          prop: 'type',
          label: $t('member.points.form.type'),
          component: 'Radio',
          rules: [{ required: true, message: $t('member.points.form.rules_type') }],
          componentProps: {
            options: [
              { label: $t('member.points.types.earn'), value: 1 },
              { label: $t('member.points.types.consume'), value: 2 },
              { label: $t('member.points.types.adjust'), value: 3 }
            ]
          },
          defaultValue: 1,
          colSpan: 24
        },
        {
          prop: 'points',
          label: $t('member.points.form.points'),
          component: 'InputNumber',
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
          component: 'Input',
          componentProps: {
            placeholder: '例如：签到、购物、兑换等'
          },
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
    }
  }
}
