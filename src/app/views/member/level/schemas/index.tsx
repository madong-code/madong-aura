import { CrudSchema } from '@/components/crud'
import { MemberLevelService } from '@/app/api/member'
import { $t } from '@/locales'

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
        minWidth: 60
      },
      {
        prop: 'name',
        label: $t('member.level.table.columns.name'),
        minWidth: 120
      },
      {
        prop: 'icon',
        label: $t('member.level.table.columns.icon'),
        minWidth: 80,
        cellRender: {
          name: 'CellImage',
          props: {
            width: 30,
            height: 30
          }
        }
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
        prop: 'sort',
        label: $t('member.level.table.columns.sort'),
        minWidth: 80
      },
      {
        prop: 'status',
        label: $t('member.level.table.columns.status'),
        minWidth: 80,
        cellRender: {
          name: 'CellTag',
          props: {
            type: (row: any) => (row.status === 1 ? 'success' : 'danger'),
            value: (row: any) =>
              row.status === 1
                ? $t('member.level.status.enabled')
                : $t('member.level.status.disabled')
          }
        }
      },
      {
        prop: 'create_time',
        label: $t('member.level.table.columns.create_time'),
        minWidth: 160
      }
    ],
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '100px',
      schema: [
        {
          prop: 'name',
          label: $t('member.level.search.name'),
          component: 'Input'
        },
        {
          prop: 'status',
          label: $t('member.level.search.status'),
          component: 'Select',
          componentProps: {
            options: [
              { label: $t('member.level.status.enabled'), value: 1 },
              { label: $t('member.level.status.disabled'), value: 0 }
            ],
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
          prop: 'name',
          label: $t('member.level.form.name'),
          component: 'Input',
          rules: [{ required: true, message: $t('member.level.form.rules_name') }],
          componentProps: {},
          colSpan: 24
        },
        {
          prop: 'icon',
          label: $t('member.level.form.icon'),
          component: 'UploadImage',
          componentProps: {
            limit: 1
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
          prop: 'description',
          label: $t('member.level.form.description'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 3
          },
          colSpan: 24
        },
        {
          prop: 'sort',
          label: $t('member.level.form.sort'),
          component: 'InputNumber',
          componentProps: {
            min: 0,
            precision: 0
          },
          defaultValue: 0,
          colSpan: 12
        },
        {
          prop: 'status',
          label: $t('member.level.form.status'),
          component: 'Radio',
          componentProps: {
            options: [
              { label: $t('member.level.status.enabled'), value: 1 },
              { label: $t('member.level.status.disabled'), value: 0 }
            ]
          },
          defaultValue: 1,
          colSpan: 12
        }
      ]
    }
  }
}
