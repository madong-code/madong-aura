import { h } from 'vue'
import { ElTag } from 'element-plus'
import { CrudSchema } from '@/components/crud'
import { MemberService } from '@/api/member'
import { $t } from '@/locales'
import { DictEnum } from '@/enums'
import { formatDateTime } from '@/utils'

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
        prop: 'level.name',
        label: $t('member.user.table.columns.level_name')
      },
      {
        prop: 'balance',
        label: $t('member.user.table.columns.balance'),
        visible: false
      },
      {
        prop: 'points',
        label: $t('member.user.table.columns.points')
      },
      {
        prop: 'tag',
        label: $t('member.user.table.columns.tags'),
        visible: false,
        minWidth: 200,
        formatter(row) {
          return h(
            'div',
            {
              class: 'flex flex-wrap gap-2'
            },
            row.tags.map((item: any) =>
              h(
                ElTag,
                {
                  size: 'small',
                  type: 'primary'
                },
                () => item.name
              )
            )
          )
        }
      },
      {
        prop: 'enabled',
        label: $t('member.user.table.columns.enabled'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS,
          clearable: true
        }
      },
      {
        prop: 'created_at',
        label: $t('member.user.table.columns.created_at'),
        minWidth: 170,
        formatter: (row: any) => {
          return formatDateTime(row.created_at)
        }
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
          prop: 'enabled',
          label: $t('member.user.search.enabled'),
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
          ifDetail: false,
          componentProps: {
            type: 'password',

            showPassword: true
          },

          colSpan: 24,
          show: (formType: string) => formType === 'add'
        },
        // {
        //   prop: 'level_id',
        //   label: $t('member.user.form.level_id'),
        //   component: 'ApiSelect',
        //   colSpan: 24,
        //   componentProps: {
        //     api: '/member/level',
        //     requestMethod: 'GET',

        //     params: { format: 'select' }
        //   }
        // },
        {
          prop: 'enabled',
          label: $t('member.user.form.enabled'),
          component: 'ApiDict',
          colSpan: 24,
          defaultValue: 1,
          componentProps: {
            renderType: 'RadioGroup',
            isBtn: true,
            code: DictEnum.SYS_ENABLED_STATUS
          }
        }
      ]
    }
  }
}
