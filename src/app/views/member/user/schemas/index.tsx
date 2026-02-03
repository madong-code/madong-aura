import { CrudSchema } from '@/components/crud'
import { MemberService } from '@/app/api/member'
import { $t } from '@/locales'
import { DictEnum } from '@/app/enums'
import { t } from '@wangeditor/editor'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MemberService.list,
    dialogTitle: $t('member.user.title'),
    crudApi: {
      // 新增接口
      add: MemberService.create,
      // 修改接口
      edit: MemberService.update,
      // 删除接口
      remove: MemberService.remove,
      // 详情接口
      view: MemberService.get
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
    addAuth: 'member:user:create',
    // 删除权限码
    removeAuth: 'member:user:delete',
    // 修改权限码
    editAuth: 'member:user:update',
    // 详情权限码
    viewAuth: 'member:user:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      // {
      //   prop: 'id',
      //   label: $t('member.user.table.columns.id'),
      //   minWidth: 60
      // },
      {
        prop: 'username',
        label: $t('member.user.table.columns.username'),
        minWidth: 100
      },
      {
        prop: 'nickname',
        label: $t('member.user.table.columns.nickname'),
        minWidth: 100
      },
      {
        prop: 'phone',
        label: $t('member.user.table.columns.phone'),
        minWidth: 120
      },
      {
        prop: 'email',
        label: $t('member.user.table.columns.email'),
        minWidth: 150
      },
      {
        prop: 'level_name',
        label: $t('member.user.table.columns.level_name'),
        minWidth: 100
      },
      {
        prop: 'balance',
        label: $t('member.user.table.columns.balance'),
        minWidth: 100
      },
      {
        prop: 'points',
        label: $t('member.user.table.columns.points'),
        minWidth: 100
      },
      {
        prop: 'status',
        label: $t('member.user.table.columns.status'),
        minWidth: 80,
        cellRender: {
          name: 'CellTag',
          props: {
            type: (row: any) => (row.status === 1 ? 'success' : 'danger'),
            value: (row: any) =>
              row.status === 1 ? $t('member.user.status.normal') : $t('member.user.status.disabled')
          }
        }
      },
      {
        prop: 'create_time',
        label: $t('member.user.table.columns.create_time'),
        minWidth: 160
      }
    ],
    dialogProps: {
      width: '500px'
    },
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          prop: 'username',
          label: $t('member.user.search.username'),
          component: 'Input'
        },
        {
          prop: 'phone',
          label: $t('member.user.search.phone'),
          component: 'Input'
        },
        {
          prop: 'status',
          label: $t('member.user.search.status'),
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true
          },
          colSpan: 6
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
          label: $t('member.user.form.id'),
          component: 'Input',
          show: false,
          ifDetail: false,
          componentProps: {},
          colSpan: 24
        },
        {
          prop: 'username',
          label: $t('member.user.form.username'),
          component: 'Input',
          rules: [{ required: true, message: $t('member.user.form.rules_username') }],
          componentProps: {},
          colSpan: 24
        },
        {
          prop: 'nickname',
          label: $t('member.user.form.nickname'),
          component: 'Input',
          colSpan: 24,
          componentProps: {}
        },
        {
          prop: 'password',
          label: $t('member.user.form.password'),
          component: 'Input',
          defaultValue: '123456',
          colSpan: 24,
          componentProps: {
            type: 'password',
            showPassword: true
          }
        },
        {
          prop: 'phone',
          label: $t('member.user.form.phone'),
          component: 'Input',
          colSpan: 24,
          componentProps: {}
        },
        {
          prop: 'email',
          label: $t('member.user.form.email'),
          component: 'Input',
          colSpan: 24,
          componentProps: {}
        },
        {
          prop: 'password',
          label: $t('member.user.form.password'),
          component: 'Input',
          componentProps: {
            type: 'password',

            showPassword: true
          },

          colSpan: 24,
          show: (formType: string) => formType === 'add'
        },
        {
          prop: 'level_id',
          label: $t('member.user.form.level_id'),
          component: 'ApiSelect',
          colSpan: 24,
          componentProps: {
            api: '/member/level',
            requestMethod: 'GET',

            params: { format: 'select' }
          }
        },
        {
          prop: 'status',
          label: $t('member.user.form.status'),
          component: 'ApiDict',
          colSpan: 24,
          defaultValue: 1,
          componentProps: {
            type: 'button',
            code: DictEnum.SYS_ENABLED_STATUS
          }
        }
      ]
    }
  }
}
