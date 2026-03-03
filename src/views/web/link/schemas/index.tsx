import { CrudSchema } from '@/components/crud';
import { LinkService } from '@/api/web';
import { $t } from '@/locales';
import { DictEnum } from '@/enums';
import { h } from 'vue';


// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: LinkService.list,
    dialogTitle: $t('web.link.title'),
    crudApi: {
      // 新增接口
      add: LinkService.create,
      // 修改接口
      edit: LinkService.update,
      // 删除接口
      remove: LinkService.delete,
      // 详情接口
      view: LinkService.get
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
    hasView: false,
    // 新增权限码
    addAuth: 'web:link:create',
    // 删除权限码
    removeAuth: 'web:link:delete',
    // 修改权限码
    editAuth: 'web:link:update',
    // 详情权限码
    viewAuth: 'web:link:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'logo',
        label: $t('web.link.table.columns.logo'),
        component: 'Image',
        formatter: (row: any) =>{
          return h('div', {}, [
            h('img', {
              src: row.logo,
              alt: (row.logo || $t('web.link.table.columns.logo')),
              width: 40,
              height: 40
            })
          ])
        }
      },
      {
        prop: 'name',
        label: $t('web.link.table.columns.name'),
        minWidth: 120,
      },
      {
        prop: 'url',
        label: $t('web.link.table.columns.url'),
        minWidth: 200
      },
      {
        prop: 'description',
        label: $t('web.link.table.columns.description'),
        minWidth: 150
      },
      {
        prop: 'sort',
        label: $t('web.link.table.columns.sort'),
        minWidth: 80
      },
      {
        prop: 'enabled',
        label: $t('web.link.table.columns.enabled'),
        minWidth: 100,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS,
        }
      }
    ],
    dialogProps: {
      width: '500px'
    },
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '120px',
      schema: [
        {
          prop: 'LIKE_name',
          label: $t('web.link.search.name'),
          component: 'Input',
          colSpan: 6
        },
                {
          prop: 'LIKE_url',
          label: $t('web.link.search.url'),
          component: 'Input',
          colSpan: 6
        },
        {
          prop: 'EQ_enabled',
          label: $t('web.link.search.enabled'),
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
          label: 'ID',
          component: 'Input',
          show: false,
          ifDetail: false,
          componentProps: {},
          colSpan: 24
        },
        {
          prop: 'name',
          label: $t('web.link.form.name'),
          component: 'Input',
          rules: [{ required: true, message: $t('web.link.form.rules_name') }],
          componentProps: {
            placeholder: $t('web.link.form.rules_name')
          },
          colSpan: 24
        },
        {
          prop: 'url',
          label: $t('web.link.form.url'),
          component: 'Input',
          rules: [{ required: true, message: $t('web.link.form.rules_url') }],
          componentProps: {
            placeholder: $t('web.link.form.rules_url')
          },
          colSpan: 24
        },
        {
          prop: 'logo',
          label: $t('web.link.form.logo'),
          component: 'Avatar',
          componentProps: {
          },
          colSpan: 24
        },
        {
          prop: 'sort',
          label: $t('web.link.form.sort'),
          component: 'InputNumber',
          componentProps: {
            min: 0
          },
          colSpan: 24
        },
        {
          prop: 'enabled',
          label: $t('web.link.form.enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
             isBtn: true,
            renderType: 'RadioGroup'
          },
          colSpan: 24
        },
                {
          prop: 'description',
          label: $t('web.link.form.description'),
          component: 'Input',
          componentProps: {
            placeholder: $t('web.link.form.description'),
            type: 'textarea',
            rows: 4
          },
          colSpan: 24
        },
      ]
    }
  }
};
