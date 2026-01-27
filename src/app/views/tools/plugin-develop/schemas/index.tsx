import { CrudSchema } from '@/components/crud'
import { PluginDevelopService } from '@/app/api/tools/plugin-develop'
import { $t } from '@/locales'
import { formatISODate } from '@/utils'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    api: PluginDevelopService.list,
    dialogTitle: $t('plugin-develop.plugin.title'),
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
      { prop: "title", label: $t('plugin-develop.plugin.list.title') },
      { prop: "key", label: $t('plugin-develop.plugin.list.key'), component: "ApiDict", componentProps: { code: "test" } },
      { prop: "type", label: $t('plugin-develop.plugin.list.type') },
      { prop: "author", label: $t('plugin-develop.plugin.list.author') },
      { prop: "version", label: $t('plugin-develop.plugin.list.version') },
      {
        prop: "created_at",
        label: $t('plugin-develop.plugin.list.created_at'),
        formatter: (row: any) => formatISODate(row.created_at)
      },

    ],

    searchFormSchema: {
      schema: [
        { component: "input", prop: "desc", label: $t('plugin-develop.plugin.search.desc'), componentProps: { placeholder: $t('plugin-develop.plugin.search.desc') }, colSpan: 6 },
        { component: "input", prop: "title", label: $t('plugin-develop.plugin.search.title'), componentProps: { placeholder: $t('plugin-develop.plugin.search.title') }, colSpan: 6 },
        { component: "ApiSelect ", prop: "status", label: $t('plugin-develop.plugin.search.status'), componentProps: { placeholder: $t('plugin-develop.plugin.search.status') }, colSpan: 6 }
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
          label: $t('plugin-develop.plugin.form.icon'),
          prop: "icon",
          component: "Avatar",
          componentProps: {
            componentProps: {

            }
          },
          colSpan: 24
        },
        {
          label: $t('plugin-develop.plugin.form.cover'),
          prop: "cover",
          component: "Avatar",
          componentProps: {
            componentProps: {

            }
          },
          colSpan: 24
        },

        {
          label: $t('plugin-develop.plugin.form.title'),
          prop: "id",
          component: "Input",
          colSpan: 24,
          show: false,
          componentProps: {
            style: { width: '50%' }
          }
        },
        {
          label: $t('plugin-develop.plugin.form.title'),
          prop: "title",
          component: "Input",
          colSpan: 24,
          componentProps: {
            style: { width: '50%' }
          }
        },
        {
          label: $t('plugin-develop.plugin.form.key'),
          prop: "key",
          component: "Input",
          colSpan: 24,
          componentProps: { style: { width: '50%' } }
        },
        {
          label: $t('plugin-develop.plugin.form.author'),
          prop: "author",
          component: "Input",
          colSpan: 24,
          componentProps: { style: { width: '50%' } }
        },
        {
          label: $t('plugin-develop.plugin.form.version'),
          prop: "version",
          component: "Input",
          colSpan: 24,
          componentProps: { style: { width: '50%' } }
        },

        {
          label: $t('plugin-develop.plugin.form.type'),
          prop: "type",
          component: "Select",
          componentProps: {
            style: { width: '50%' },
            options: [
              { label: $t('plugin-develop.plugin.form.type_options.app'), value: 'app' },
              { label: $t('plugin-develop.plugin.form.type_options.module'), value: 'module' },
            ]
          },
          colSpan: 24
        },
        {
          label: $t('plugin-develop.plugin.form.desc'),
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
