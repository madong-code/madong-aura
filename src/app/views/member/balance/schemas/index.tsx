import { CrudSchema } from '@/components/crud'
import { MemberBalanceService, MemberService } from '@/app/api/member'
import { $t } from '@/locales'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MemberBalanceService.list,
    dialogTitle: $t('member.balance.title'),
    crudApi: {
      // 新增接口
      add: MemberBalanceService.create,
      // 修改接口
      edit: MemberBalanceService.update,
      // 删除接口
      remove: MemberBalanceService.remove,
      // 详情接口
      view: MemberBalanceService.get
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
    addAuth: 'member:balance:operate',
    // 详情权限码
    viewAuth: 'member:balance:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'id',
        label: $t('member.balance.table.columns.id'),
        minWidth: 60
      },
      {
        prop: 'username',
        label: $t('member.balance.table.columns.username'),
        minWidth: 100
      },
      {
        prop: 'nickname',
        label: $t('member.balance.table.columns.nickname'),
        minWidth: 100
      },
      {
        prop: 'type',
        label: $t('member.balance.table.columns.type'),
        minWidth: 100,
        cellRender: {
          name: 'CellTag',
          props: {
            type: (row: any) => (row.type === 1 || row.type === 3 ? 'success' : 'danger'),
            value: (row: any) =>
              row.type === 1
                ? $t('member.balance.types.recharge')
                : row.type === 2
                  ? $t('member.balance.types.consume')
                  : row.type === 3
                    ? $t('member.balance.types.refund')
                    : $t('member.balance.types.adjust')
          }
        }
      },
      {
        prop: 'amount',
        label: $t('member.balance.table.columns.amount'),
        minWidth: 100,
        formatter: (row: any) => {
          const prefix = row.type === 1 || row.type === 3 ? '+' : '-'
          return `${prefix}${row.amount}`
        }
      },
      {
        prop: 'balance_after',
        label: $t('member.balance.table.columns.balance_after'),
        minWidth: 120
      },
      {
        prop: 'remark',
        label: $t('member.balance.table.columns.remark'),
        minWidth: 200,
        showOverflowTooltip: true
      },
      {
        prop: 'operator',
        label: $t('member.balance.table.columns.operator'),
        minWidth: 100
      },
      {
        prop: 'create_time',
        label: $t('member.balance.table.columns.create_time'),
        minWidth: 160
      }
    ],
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '100px',
      schema: [
        {
          prop: 'username',
          label: $t('member.balance.search.username'),
          component: 'Input'
        },
        {
          prop: 'nickname',
          label: $t('member.balance.search.nickname'),
          component: 'Input'
        },
        {
          prop: 'type',
          label: $t('member.balance.search.type'),
          component: 'Select',
          componentProps: {
            options: [
              { label: $t('member.balance.types.recharge'), value: 1 },
              { label: $t('member.balance.types.consume'), value: 2 },
              { label: $t('member.balance.types.refund'), value: 3 },
              { label: $t('member.balance.types.adjust'), value: 4 }
            ],
            clearable: true
          }
        },
        {
          prop: 'date_range',
          label: $t('member.balance.search.date_range'),
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
          label: $t('member.balance.form.member_id'),
          component: 'Select',
          rules: [{ required: true, message: $t('member.balance.form.rules_member_id') }],
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
          label: $t('member.balance.form.type'),
          component: 'Radio',
          rules: [{ required: true, message: $t('member.balance.form.rules_type') }],
          componentProps: {
            options: [
              { label: $t('member.balance.types.recharge'), value: 1 },
              { label: $t('member.balance.types.consume'), value: 2 },
              { label: $t('member.balance.types.refund'), value: 3 },
              { label: $t('member.balance.types.adjust'), value: 4 }
            ]
          },
          defaultValue: 1,
          colSpan: 24
        },
        {
          prop: 'amount',
          label: $t('member.balance.form.amount'),
          component: 'InputNumber',
          rules: [{ required: true, message: $t('member.balance.form.rules_amount') }],
          componentProps: {
            min: 0.01,
            precision: 2
          },
          colSpan: 12
        },
        {
          prop: 'remark',
          label: $t('member.balance.form.remark'),
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
