import { CrudSchema } from '@/components/crud'
import { MemberTagService } from '@/api/member'
import { $t } from '@/locales'
import { DictEnum } from '@/enums'
import { formatter } from 'element-plus'
import { formatISODate } from '@/utils'
import { fa } from 'element-plus/es/locale'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MemberTagService.list,
    dialogTitle: $t('member.tag.title'),
    crudApi: {
      // 新增接口
      add: MemberTagService.create,
      // 修改接口
      edit: MemberTagService.update,
      // 删除接口
      remove: MemberTagService.remove,
      // 详情接口
      view: MemberTagService.get
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
    addAuth: 'member:tag:create',
    // 删除权限码
    removeAuth: 'member:tag:delete',
    // 修改权限码
    editAuth: 'member:tag:update',
    // 详情权限码
    viewAuth: 'member:tag:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      // {
      //   prop: 'id',
      //   label: $t('member.tag.table.columns.id'),
      //   minWidth: 60
      // },
      {
        prop: 'name',
        label: $t('member.tag.table.columns.name'),
        minWidth: 120
      },
      {
        prop: 'color',
        label: $t('member.tag.table.columns.color'),
        minWidth: 100,
        cellRender: {
          name: 'CellTag',
          props: {
            type: 'info',
            value: (row: any) => row.name,
            style: (row: any) => ({
              backgroundColor: row.color,
              color: '#fff'
            })
          }
        }
      },
      {
        prop: 'member_count',
        label: $t('member.tag.table.columns.member_count'),
        minWidth: 100
      },
      {
        prop: 'description',
        label: $t('member.tag.table.columns.description'),
        minWidth: 200,
        showOverflowTooltip: true
      },
      {
        prop: 'sort',
        label: $t('member.tag.table.columns.sort'),
        minWidth: 80
      },
      {
        prop: 'enabled',
        label: $t('member.tag.table.columns.enabled'),
        minWidth: 80,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS,
          clearable: true
        }
      },
      {
        prop: 'created_at',
        label: $t('member.tag.table.columns.create_time'),
        minWidth: 160,
        formatter: (row: any) => {
          return formatISODate(row.created_at)
        }
      }
    ],

    dialogProps: {
      width: '500px'
    },
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '100px',
      schema: [
        {
          prop: 'LIKE_name',
          label: $t('member.tag.search.name'),
          component: 'Input'
        },
        {
          prop: 'EQ_enabled',
          label: $t('member.tag.search.enabled'),
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
          label: $t('member.tag.form.id'),
          component: 'Input',
          show: false,
          ifDetail: false
        },
        {
          prop: 'name',
          label: $t('member.tag.form.name'),
          component: 'Input',
          rules: [{ required: true, message: $t('member.tag.form.rules_name') }],
          componentProps: {},
          colSpan: 24
        },
        // {
        //   prop: 'color',
        //   label: $t('member.tag.form.color'),
        //   component: 'ColorPicker',
        //   show: false,
        //   rules: [{ required: true, message: $t('member.tag.form.rules_color') }],
        //   componentProps: {},
        //   colSpan: 24
        // },
        {
          prop: 'description',
          label: $t('member.tag.form.description'),
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 3
          },
          colSpan: 24
        },
        {
          prop: 'sort',
          label: $t('member.tag.form.sort'),
          component: 'InputNumber',
          componentProps: {
            min: 0,
            precision: 0
          },
          defaultValue: 0,
          colSpan: 24
        },
        {
          prop: 'enabled',
          label: $t('member.tag.form.enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            isBtn: true,
            renderType: 'RadioGroup',
            code: DictEnum.SYS_ENABLED_STATUS
          },
          colSpan: 24
        }
      ]
    }
  }
}
