import { MenuService } from '@/api/web'
import { DictEnum } from '@/enums'
import { CrudSchema } from '@/components/crud'
import { Icon } from '@/components/icon'
import { $t } from '@/locales'
import api from '@/utils/http'
import { h } from 'vue'
import { request } from 'http'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MenuService.list,
    dialogTitle: $t('web.menu.title'),
    tree: {
      id: 'id',
      pid: 'parent_id'
    },
    crudApi: {
      // 新增接口
      add: MenuService.create,
      // 修改接口
      edit: MenuService.update,
      // 删除接口
      remove: MenuService.remove,
      // 详情接口
      view: MenuService.get
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
    addAuth: 'web:menu:create',
    // 删除权限码
    removeAuth: 'web:menu:delete',
    // 修改权限码
    editAuth: 'web:menu:update',
    // 详情权限码
    viewAuth: 'web:menu:read',
    rowKey: 'id',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'name',
        label: $t('web.menu.table.columns.name'),
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
        label: $t('web.menu.table.columns.category'),
        prop: 'category',
        component: 'ApiDict',
        align: 'center',
        componentProps: {
          code: DictEnum.WEB_MENU_CATEGORY
        }
      },
      {
        prop: 'url',
        label: $t('web.menu.table.columns.url'),
        minWidth: 100,
        formatter(row) {
          if (row.type === 1) {
            return '/'
          }
        }
      },
      {
        prop: 'sort',
        label: $t('web.menu.table.columns.sort')
      },
      {
        prop: 'type',
        label: $t('web.menu.table.columns.type'),
        component: 'ApiDict',
        align: 'left',
        componentProps: {
          code: DictEnum.WEB_MENU_TYPE
        }
      },
      {
        prop: 'target',
        label: $t('web.menu.table.columns.target'),
        align: 'center',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.WEB_MENU_TARGET
        }
      },
      {
        prop: 'is_show',
        label: $t('web.menu.table.columns.is_show'),
        align: 'center',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_YES_NO
        }
      },
      {
        prop: 'enabled',
        label: $t('web.menu.table.columns.enabled'),
        component: 'ApiDict',
        align: 'center',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        }
      }
    ],
    // 内置弹窗配置
    dialogProps: {
      width: '60%',
      dialogType: 'drawer'
    },
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '120px',
      schema: [
        {
          label: $t('web.menu.search.app'),
          prop: 'app',
          component: 'ApiSelect',
          colSpan: 6,
          rules: [],
          componentProps: (_value) => {
            return {
              api: '/system/menu/app/list',
              requestMethod: 'GET'
            }
          }
        },
        {
          prop: 'EQ_category',
          label: $t('web.menu.search.category'),
          component: 'ApiDict',
          colSpan: 6,
          componentProps: {
            code: DictEnum.WEB_MENU_CATEGORY
          }
        },
        {
          prop: 'LINK_name',
          label: $t('web.menu.search.name'),
          component: 'Input',
          colSpan: 6
        },
        {
          prop: 'type',
          label: $t('web.menu.search.type'),
          component: 'ApiDict',
          componentProps: {
            placeholder: $t('web.menu.form.placeholder_type'),
            code: DictEnum.WEB_MENU_TYPE,
            clearable: true
          },
          colSpan: 6
        }
      ]
    },
    // crud表单配置
    formSchema: {
      showDefaultActions: true,
      labelWidth: '130px',
      schema: [
        {
          label: 'ID',
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          label: $t('web.menu.form.category'),
          prop: 'category',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 24,
          rules: [],
          componentProps: {
            renderType: 'RadioGroup',
            placeholder: $t('web.menu.form.placeholder_type'),
            code: DictEnum.WEB_MENU_CATEGORY,
            isBtn: true
          }
        },
        {
          label: $t('web.menu.form.app'),
          prop: 'app',
          component: 'ApiSelect',
          defaultValue: 'web',
          colSpan: 24,
          rules: [],
          componentProps: (_value) => {
            return {
              api: '/system/menu/app/list',
              requestMethod: 'GET',
              placeholder: $t('web.menu.form.placeholder_app'),
              style: {
                width: '330px'
              }
            }
          }
        },
        {
          label: $t('web.menu.form.source'),
          prop: 'source',
          component: 'Input',
          colSpan: 24,
          defaultValue: 'create',
          componentProps: {
            placeholder: $t('web.menu.form.source'),
            clearable: true
          }
        },
        {
          label: $t('web.menu.form.name'),
          prop: 'name',
          component: 'Input',
          colSpan: 24,
          rules: [{ required: true, message: $t('web.menu.form.rules_name') }],
          componentProps: {
            placeholder: $t('web.menu.form.name'),
            clearable: true
          }
        },
        {
          label: $t('web.menu.form.type'),
          prop: 'type',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 24,
          rules: [{ required: true, message: $t('web.menu.form.rules_type') }],
          componentProps: {
            code: DictEnum.WEB_MENU_TYPE,
            placeholder: $t('web.menu.form.placeholder_type'),
            clearable: false
          }
        },
        {
          label: $t('web.menu.form.pid'),
          prop: 'pid',
          component: 'ApiTreeSelect',
          colSpan: 24,
          componentProps: (values) => {
            return {
              placeholder: $t('web.menu.form.placeholder_pid'),
              clearable: true,
              checkStrictly: true,
              api: '/web/menu',
              requestMethod: 'get',
              params: {
                format: 'tree',
                app: values.app || 'web',
                category: values.category || 1
              },
              labelField: 'name',
              valueField: 'id'
            }
          }
        },
        {
          label: $t('web.menu.form.url'),
          prop: 'url',
          component: 'Input',
          colSpan: 24,
          ifShow(values) {
            return [2, 3, 4].includes(values.type)
          },
          componentProps: (values) => {
            return {
              placeholder: $t('web.menu.form.placeholder_url'),
              clearable: true,
              disabled: ![2, 3, 4].includes(values.type)
            }
          }
        },
        {
          label: $t('web.menu.form.target'),
          prop: 'target',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 24,
          ifShow(values) {
            return [2, 3, 4].includes(values.type)
          },
          componentProps: (values) => {
            return {
              code: DictEnum.WEB_MENU_TARGET,
              placeholder: $t('web.menu.form.placeholder_target'),
              disabled: ![2, 3, 4].includes(values.type),
              clearable: false
            }
          }
        },
        {
          label: $t('web.menu.form.icon'),
          prop: 'icon',
          component: 'IconPicker',
          colSpan: 12,
          componentProps: (values) => {
            return {
              class: 'w-full',
              placeholder: $t('web.menu.form.placeholder_icon'),
              clearable: true
            }
          }
        },
        {
          label: $t('web.menu.form.sort'),
          prop: 'sort',
          component: 'InputNumber',
          defaultValue: 999,
          colSpan: 12,
          componentProps: {
            placeholder: $t('web.menu.form.placeholder_sort'),
            clearable: true,
            min: -1
          }
        },
        {
          label: $t('web.menu.form.enabled'),
          prop: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 12,
          componentProps: {
            placeholder: $t('web.menu.form.placeholder_enabled'),
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true,
            renderType: 'RadioGroup'
          }
        },
        {
          label: $t('web.menu.form.is_show'),
          prop: 'is_show',
          component: 'ApiDict',
          colSpan: 12,
          defaultValue: 1,
          componentProps: {
            placeholder: $t('web.menu.form.placeholder_is_show'),
            code: DictEnum.SYS_YES_NO,
            isBtn: true,
            renderType: 'RadioGroup'
          }
        }
      ]
    }
  }
}
