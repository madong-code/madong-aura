import { CrudSchema } from '@/components/crud'
import { PluginDevelopService } from '@/api/tools/plugin-develop'
import { $t } from '@/locales'
import { formatISODate } from '@/utils'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    api: PluginDevelopService.list,
    dialogTitle: $t('tools.plugin.develop.title'),
    crudApi: {
      add: PluginDevelopService.create,
      edit: PluginDevelopService.update,
      remove: PluginDevelopService.remove,
      view: PluginDevelopService.get
    },
    useCrud: true,
    hasAdd: true,
    hasRemove: false,
    hasEdit: true,
    hasView: false,
    addAuth: 'plugin:develop:create',
    removeAuth: 'plugin:develop:delete',
    editAuth: 'plugin:develop:update',
    viewAuth: 'plugin:develop:read',

    useSearchForm: true,

    columns: [
      {
        type: 'selection'
      },
      { prop: "title", label: $t('tools.plugin.develop.list.title') },
      { prop: "key", label: $t('tools.plugin.develop.list.key'), component: "ApiDict", componentProps: { code: "test" } },
      { prop: "type", label: $t('tools.plugin.develop.list.type') },
      { prop: "author", label: $t('tools.plugin.develop.list.author') },
      { prop: "version", label: $t('tools.plugin.develop.list.version') },
      {
        prop: "created_at",
        label: $t('tools.plugin.develop.list.created_at'),
        formatter: (row: any) => formatISODate(row.created_at)
      },

    ],

    searchFormSchema: {
      schema: [
        { component: "input", prop: "desc", label: $t('tools.plugin.develop.search.desc'), componentProps: { placeholder: $t('tools.plugin.develop.search.desc') }, colSpan: 6 },
        { component: "input", prop: "title", label: $t('tools.plugin.develop.search.title'), componentProps: { placeholder: $t('tools.plugin.develop.search.title') }, colSpan: 6 },
        { component: "ApiSelect ", prop: "status", label: $t('tools.plugin.develop.search.status'), componentProps: { placeholder: $t('tools.plugin.develop.search.status') }, colSpan: 6 }
      ]
    },

    dialogProps: {
      width: '50%',
      dialogType: "drawer"
    },

    formSchema: {
      showDefaultActions: false,
      labelWidth: '100px',
      schema: [
        {
          label: $t('tools.plugin.develop.form.icon'),
          prop: "icon",
          component: "Avatar",
          componentProps: {
            componentProps: {

            }
          },
          colSpan: 24
        },
        {
          label: $t('tools.plugin.develop.form.cover'),
          prop: "cover",
          component: "Avatar",
          componentProps: {
            componentProps: {

            }
          },
          colSpan: 24
        },

        {
          label: $t('tools.plugin.develop.form.title'),
          prop: "id",
          component: "Input",
          colSpan: 24,
          show: false,
          componentProps: {
            style: { width: '50%' }
          }
        },
        {
          label: $t('tools.plugin.develop.form.title'),
          prop: "title",
          component: "Input",
          colSpan: 24,
          componentProps: {
            style: { width: '50%' }
          }
        },
        {
          label: $t('tools.plugin.develop.form.key'),
          prop: "key",
          component: "Input",
          colSpan: 24,
          componentProps: { style: { width: '50%' } }
        },
        {
          label: $t('tools.plugin.develop.form.author'),
          prop: "author",
          component: "Input",
          colSpan: 24,
          componentProps: { style: { width: '50%' } }
        },
        {
          label: $t('tools.plugin.develop.form.version'),
          prop: "version",
          component: "Input",
          colSpan: 24,
          componentProps: { style: { width: '50%' } }
        },

        {
          label: $t('tools.plugin.develop.form.type'),
          prop: "type",
          component: "Select",
          componentProps: {
            style: { width: '50%' },
            options: [
              { label: $t('tools.plugin.develop.form.type_options.app'), value: 'app' },
              { label: $t('tools.plugin.develop.form.type_options.module'), value: 'module' },
            ]
          },
          colSpan: 24
        },
        {
          label: $t('tools.plugin.develop.form.desc'),
          prop: "desc",
          component: "Input",
          componentProps: {
            rows: 4,
            type: 'textarea'
          },
          colSpan: 24
        },
      ]
    }
  }
}
