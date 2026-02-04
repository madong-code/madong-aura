import { CrudSchema } from '@/components/crud'
import { MemberLevelService } from '@/app/api/member'
import { $t } from '@/locales'
import { DictEnum } from '@/app/enums'
import { max } from 'xe-utils'
import { Icon } from '@/components/icon'
import { h } from 'vue'
import { formatDateTime } from '@/utils'
// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MemberLevelService.list,
    dialogTitle: $t('member.level.title'),
    crudApi: {
      // 新增接口
      add: MemberLevelService.create,
      // 修改接口
      edit: MemberLevelService.update,
      // 删除接口
      remove: MemberLevelService.remove,
      // 详情接口
      view: MemberLevelService.get
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
    addAuth: 'member:level:create',
    // 删除权限码
    removeAuth: 'member:level:delete',
    // 修改权限码
    editAuth: 'member:level:update',
    // 详情权限码
    viewAuth: 'member:level:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'id',
        label: $t('member.level.table.columns.id'),
        minWidth: 60,
        visible: false
      },
      {
        prop: 'level',
        label: $t('member.level.table.columns.level'),
        minWidth: 100
      },
      {
        prop: 'name',
        label: $t('member.level.table.columns.name'),
        formatter: (row) => {
          return row.icon
            ? h('span', {}, [
                h(Icon, {
                  icon: row.icon
                }),
                h(
                  'span',
                  {
                    style: {
                      paddingLeft: '6px'
                    }
                  },
                  row.name
                )
              ])
            : h('span', {}, row.name)
        },
        minWidth: 200
      },
      {
        prop: 'min_points',
        label: $t('member.level.table.columns.min_points'),
        minWidth: 100
      },
      {
        prop: 'discount',
        label: $t('member.level.table.columns.discount'),
        minWidth: 100,
        formatter: (row: any) => `${row.discount}%`
      },
      {
        prop: 'member_count',
        label: $t('member.level.table.columns.member_count'),
        minWidth: 100
      },
      {
        prop: 'enabled',
        label: $t('member.level.table.columns.enabled'),
        minWidth: 80,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        }
      },
      {
        prop: 'created_at',
        label: $t('member.level.table.columns.created_at'),
        minWidth: 160,
        formatter: (row: any) => {
          return formatDateTime(row.created_at)
        }
      }
    ],
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '100px',
      schema: [
        {
          prop: 'LINK_name',
          label: $t('member.level.search.name'),
          component: 'Input'
        },
        {
          prop: 'EQ_enabled',
          label: $t('member.level.search.enabled'),
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true
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
          prop: 'id',
          label: $t('member.level.form.id'),
          component: 'Input',
          show: false,
          ifDetail: false
        },
        {
          prop: 'name',
          label: $t('member.level.form.name'),
          component: 'Input',
          rules: [{ required: true, message: $t('member.level.form.rules_name') }],
          componentProps: {},
          colSpan: 24
        },
        {
          prop: 'level',
          label: $t('member.level.form.level'),
          component: 'Input',
          rules: [{ required: true, message: $t('member.level.form.rules_level') }],
          defaultValue: 1,
          componentProps: {
            style: { width: '100%' },
            type: 'number',
            min: 1,
            max: 9999,
            precision: 0
          },
          colSpan: 24
        },
        {
          prop: 'min_points',
          label: $t('member.level.form.min_points'),
          component: 'InputNumber',
          rules: [{ required: true, message: $t('member.level.form.rules_min_points') }],
          componentProps: {
            min: 0,
            precision: 0
          },
          colSpan: 12
        },
        {
          prop: 'discount',
          label: $t('member.level.form.discount'),
          component: 'InputNumber',
          rules: [{ required: true, message: $t('member.level.form.rules_discount') }],
          componentProps: {
            min: 0,
            max: 100,
            precision: 0
          },
          colSpan: 12
        },
        {
          label: $t('member.level.form.icon'),
          prop: 'icon',
          component: 'IconPicker',
          colSpan: 12,
          componentProps: (__values: any) => {
            return {
              class: 'w-full',
              clearable: true
            }
          }
        },
        {
          prop: 'enabled',
          label: $t('member.level.form.enabled'),
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            renderType: 'RadioGroup',
            isBtn: true
          },
          defaultValue: 1,
          colSpan: 12
        },

        {
          prop: 'description',
          label: $t('member.level.form.description'),
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
