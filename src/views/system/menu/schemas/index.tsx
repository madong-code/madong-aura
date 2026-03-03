import { MenuService } from '@/api/system/menu'
import { CrudSchema } from '@/components/crud'
import { Icon } from '@/components/icon'
import { DictEnum } from '@/enums'
import { $t } from '@/locales'
import { h } from 'vue'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MenuService.list,
    dialogTitle: $t('system.menu.form.modal.title'),
    tree: {
      id: 'id',
      pid: 'pid'
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
    addAuth: 'system:menu:create',
    // 删除权限码
    removeAuth: 'system:menu:delete',
    // 修改权限码
    editAuth: 'system:menu:update',
    // 详情权限码
    viewAuth: 'system:menu:read',
    rowKey: 'id',
    // 表格列定义
    columns: [
      {
        prop: 'title',
        label: $t('system.menu.list.table.columns.title'),
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
                row.title
              )
            ])
            : h('span', {}, row.title)
        },
        minWidth: 200
      },
      {
        prop: 'code',
        label: $t('system.menu.list.table.columns.code'),
        width: 200,
      },
      {
        prop: 'type',
        label: $t('system.menu.list.table.columns.type'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_MENU_TYPE,
        }
      },
      {
        prop: 'path',
        label: $t('system.menu.list.table.columns.path')
      },
      {
        prop: 'component',
        label: $t('system.menu.list.table.columns.component')
      },
      {
        prop: 'sort',
        label: $t('system.menu.list.table.columns.sort')
      },
      {
        prop: 'enabled',
        label: $t('system.menu.list.table.columns.enabled'),
        component: 'ApiDict',
        componentProps: {
          code: 'yes_no',
          typeMap: {
            1: 'success',
            0: 'danger'
          },
          useColorList: false
        }
      }
    ],
    // 树型是全量数据，不需要搜索
    useSearchForm: true,
    // 内置弹窗配置
    dialogProps: {
      width: '60%',
      dialogType: 'drawer'
    },
    searchFormSchema: {
      schema: [
        {
          component: 'ApiDict',
          prop: 'EQ_type',
          label: $t('system.menu.list.query.type'),
          componentProps: {
            code: DictEnum.SYS_MENU_TYPE,
            clearable: true,
            placeholder: $t('system.menu.list.query.placeholder.type'),
          },
        },
        {
          component: 'Select',
          prop: 'EQ_plugin',
          label: $t('system.menu.list.query.enabled'),
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
            placeholder: $t('system.menu.list.query.placeholder.enabled'),
          },
        },
        {
          component: 'ApiSelect',
          prop: 'EQ_app',
          label: $t('system.menu.form.modal.app'),
          defaultValue: 'admin',
          componentProps: {
            api: '/system/menu/app/list',
            requestMethod: 'GET',
            placeholder: $t('system.menu.form.placeholder.app'),
            clearable: true,
          },
        },
        {
          component: 'Input',
          prop: 'LIKE_title',
          label: $t('system.menu.list.query.title'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.menu.list.query.placeholder.title'),
          }
        },
        {
          component: 'Input',
          prop: 'LIKE_code',
          label: $t('system.menu.list.query.code'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.menu.list.query.placeholder.code'),
          }
        },
        {
          component: 'Input',
          prop: 'LIKE_path',
          label: $t('system.menu.list.query.path'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.menu.list.query.placeholder.path'),
          }
        },
        {
          component: 'ApiDict',
          componentProps: {
            clearable: true,
            code: DictEnum.SYS_ENABLED_STATUS,
            placeholder: $t('system.menu.list.query.placeholder.enabled'),
          },
          prop: 'enabled',
          label: $t('system.menu.list.query.enabled'),
        },

      ]
    },
    // crud表单配置
    formSchema: {
      showDefaultActions: false,
      labelWidth: '130px',
      schema: [
        // 菜单ID（隐藏字段）
        {
          label: $t('system.menu.form.modal.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          label: $t('system.menu.form.modal.type'),
          prop: 'type',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 24,
          rules: [],
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.type'),
            code: DictEnum.SYS_MENU_TYPE,
            isBtn: true,
            renderType: 'RadioGroup'
          }
        },
        {
          label: $t('system.menu.form.modal.app'),
          prop: 'app',
          component: 'ApiSelect',
          defaultValue: 'admin',
          colSpan: 24,
          rules: [],
          componentProps: (_value) => {
            return {
              api: '/system/menu/app/list',
              requestMethod: 'GET',
              placeholder: $t('system.menu.form.placeholder.app'),
              style: {
                width: '330px',
              }
            }

          }
        },

        // 所属上级
        {
          label: $t('system.menu.form.modal.pid'),
          prop: 'pid',
          component: 'ApiTreeSelect',
          colSpan: 12,
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.pid'),
              clearable: true,
              checkStrictly: true,
              api: '/system/menu',
              params: {
                format: 'tree',
                app: values.app || 'admin'  // 根据当前选择的应用过滤上级菜单
              },
              labelField: 'name',
              valueField: 'id'
            }
          }
        },

        // 菜单名称
        {
          label: $t('system.menu.form.modal.title'),
          prop: 'title',
          component: 'Input',
          colSpan: 12,
          rules: [
            {
              required: true,
              message: $t('system.menu.form.placeholder.title'),
            }
          ],
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.title'),
            clearable: true
          }
        },

        // 唯一编码
        {
          label: $t('system.menu.form.modal.code'),
          prop: 'code',
          component: 'Input',
          colSpan: 12,
          rules: [
            {
              required: true,
              message: $t('system.menu.form.placeholder.code'),
            }
          ],
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.code'),
            clearable: true
          }
        },

        // 路由/接口地址
        {
          label: $t('system.menu.form.modal.path'),
          prop: 'path',
          component: 'Input',
          colSpan: 12,
          helpMessage: $t('system.menu.form.help.path'),
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.path'),
              clearable: true,
              disabled: ![1, 2, 4].includes(values.type)
            }
          }
        },

        // 组件地址
        {
          label: $t('system.menu.form.modal.component'),
          prop: 'component',
          component: 'Input',
          colSpan: 12,
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.component'),
              clearable: true,
              disabled: ![1, 2].includes(values.type)
            }
          }
        },

        // 打开方式
        {
          label: $t('system.menu.form.modal.open_type'),
          prop: 'openType',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 12,
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.open_type'),
              code: 'sys_menu_open_type',
              isBtn: true,
              renderType: 'RadioGroup',
              disabled: values.type !== 2
            }
          }
        },

        // 图标
        {
          label: $t('system.menu.form.modal.icon'),
          prop: 'icon',
          component: 'IconPicker',
          colSpan: 12,
          componentProps: (values) => {
            return {
              class: 'w-full',
              placeholder: $t('system.menu.form.placeholder.icon'),
              clearable: true,
              disabled: ![1, 2].includes(values.type)
            }
          }
        },

        // 内外链地址
        {
          label: $t('system.menu.form.modal.link_url'),
          prop: 'url',
          component: 'Input',
          colSpan: 12,
          helpMessage: $t('system.menu.form.help.link_url'),
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.link_url'),
              clearable: true,
              disabled: ![2, 3].includes(values.openType)
            }
          }
        },

        // 排序
        {
          label: $t('system.menu.form.modal.sort'),
          prop: 'sort',
          component: 'InputNumber',
          colSpan: 12,
          defaultValue: 999,
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.sort'),
            clearable: true
          }
        },

        // 是否启用
        {
          label: $t('system.menu.form.modal.enabled'),
          prop: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 6,
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.enabled'),
            code: 'yes_no',
            isBtn: true,
            renderType: 'RadioGroup'
          }
        },

        // 是否显示
        {
          label: $t('system.menu.form.modal.is_show'),
          prop: 'isShow',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 6,
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.is_show'),
              code: 'yes_no',
              isBtn: true,
              renderType: 'RadioGroup',
              disabled: ![1, 2].includes(values.type)
            }
          }
        },

        // 是否同步
        {
          label: $t('system.menu.form.modal.is_sync'),
          prop: 'isSync',
          component: 'ApiDict',
          defaultValue: 0,
          colSpan: 6,
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.is_sync'),
            code: 'yes_no',
            isBtn: true,
            renderType: 'RadioGroup'
          }
        },

        // 是否缓存
        {
          label: $t('system.menu.form.modal.is_cache'),
          prop: 'isCache',
          component: 'ApiDict',
          defaultValue: 0,
          colSpan: 6,
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.is_cache'),
              code: 'yes_no',
              isBtn: true,
              renderType: 'RadioGroup',
              disabled: ![1, 2].includes(values.type)
            }
          }
        }
      ]
    }
  }
}
