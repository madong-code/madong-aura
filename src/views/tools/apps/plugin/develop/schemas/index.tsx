import { CrudSchema } from '@/components/crud'
import { PluginDevelopService } from '@/api/tools/apps/develop'
import { $t } from '@/locales'
import { formatISODate } from '@/utils'
import { h } from 'vue'
import { DictEnum } from '@/enums'

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
    hasAdd: false,
    hasRemove: false,
    hasEdit: false,
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
      {
        prop: 'title',
        label: $t('tools.plugin.develop.list.title'),
        minWidth: 200,
        render: (row: any) => {
          return h('div', { class: 'plugin-title-cell' }, [
            h('div', { class: 'plugin-title-row' }, [
              h('img', {
                src: row.icon,
                class: 'plugin-icon',
                alt: row.title
              }),
              h('span', { class: 'plugin-title' }, row.title),
              // 已安装标签
              row.installed_at
                ? h(
                    'el-tag',
                    {
                      type: 'success',
                      size: 'small',
                      effect: 'dark',
                      style: { marginLeft: '8px' }
                    },
                    '已安装'
                  )
                : null
            ])
          ])
        }
      },
      {
        prop: 'key',
        label: $t('tools.plugin.develop.list.key'),
        component: 'ApiDict',
        componentProps: { code: 'test' }
      },
      { prop: 'type', label: $t('tools.plugin.develop.list.type') },
      { prop: 'author', label: $t('tools.plugin.develop.list.author') },
      { prop: 'version', label: $t('tools.plugin.develop.list.version') },
      {
        prop: 'status',
        label: $t('tools.plugin.develop.list.status'),
        width: 100,
        component: 'ApiDict',
        componentProps: { code: DictEnum.SYS_ENABLED_STATUS }
      },
      {
        prop: 'install_status',
        label: $t('tools.plugin.develop.list.install_status'),
        width: 140,
        formatter: (row: any) => {
          const isInstalled = row.installed_at > 0
          return h('div', { class: 'install-status-cell' }, [
            h(
              'el-tag',
              {
                type: isInstalled ? 'success' : 'info',
                size: 'small',
                effect: isInstalled ? 'dark' : 'plain'
              },
              isInstalled ? $t('tools.plugin.develop.list.installed') : $t('tools.plugin.develop.list.uninstalled')
            ),
            isInstalled &&
              h(
                'span',
                {
                  class: 'install-time'
                },
                formatISODate(row.installed_at)
              )
          ])
        }
      },

      {
        prop: 'created_at',
        label: $t('tools.plugin.develop.list.created_at'),
        width: 180,
        formatter: (row: any) => formatISODate(row.created_at)
      }
    ],

    searchFormSchema: {
      schema: [
        {
          component: 'input',
          prop: 'desc',
          label: $t('tools.plugin.develop.search.desc'),
          componentProps: { placeholder: $t('tools.plugin.develop.search.desc') },
          colSpan: 6
        },
        {
          component: 'input',
          prop: 'title',
          label: $t('tools.plugin.develop.search.title'),
          componentProps: { placeholder: $t('tools.plugin.develop.search.title') },
          colSpan: 6
        },
        {
          component: 'ApiSelect ',
          prop: 'status',
          label: $t('tools.plugin.develop.search.status'),
          componentProps: { placeholder: $t('tools.plugin.develop.search.status') },
          colSpan: 6
        }
      ]
    },

    dialogProps: {
      width: '50%',
      dialogType: 'drawer'
    },

    formSchema: {
      showDefaultActions: false,
      labelWidth: '100px',
      schema: [
        {
          label: $t('tools.plugin.develop.form.icon'),
          prop: 'icon',
          component: 'Avatar',
          componentProps: {
            componentProps: {}
          },
          colSpan: 24
        },
        {
          label: $t('tools.plugin.develop.form.cover'),
          prop: 'cover',
          component: 'Avatar',
          componentProps: {
            componentProps: {}
          },
          colSpan: 24
        },

        {
          label: $t('tools.plugin.develop.form.title'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          componentProps: {
            style: { width: '50%' }
          }
        },
        {
          label: $t('tools.plugin.develop.form.title'),
          prop: 'title',
          component: 'Input',
          colSpan: 24,
          componentProps: {
            style: { width: '50%' }
          }
        },
        {
          label: $t('tools.plugin.develop.form.key'),
          prop: 'key',
          component: 'Input',
          colSpan: 24,
          componentProps: {
            style: { width: '50%' },
            disabled: true,
            placeholder: $t('tools.plugin.develop.form.key_disabled')
          }
        },
        {
          label: $t('tools.plugin.develop.form.author'),
          prop: 'author',
          component: 'Input',
          colSpan: 24,
          componentProps: { style: { width: '50%' } }
        },
        {
          label: $t('tools.plugin.develop.form.version'),
          prop: 'version',
          component: 'Input',
          colSpan: 24,
          componentProps: { style: { width: '50%' } }
        },

        {
          label: $t('tools.plugin.develop.form.type'),
          prop: 'type',
          component: 'Select',
          componentProps: {
            style: { width: '50%' },
            options: [
              { label: $t('tools.plugin.develop.form.type_options.app'), value: 'app' },
              {
                label: $t('tools.plugin.develop.form.type_options.module'),
                value: 'module'
              }
            ]
          },
          colSpan: 24
        },
        {
          label: $t('tools.plugin.develop.form.desc'),
          prop: 'desc',
          component: 'Input',
          componentProps: {
            rows: 4,
            type: 'textarea'
          },
          colSpan: 24
        }
      ]
    }
  }
}
