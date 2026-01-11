import { MenuService } from '@/api/system/menu'
import { CrudSchema } from '@/components/crud'
import { Icon } from '@/components/icon'
import { DictEnum } from '@/enums'
import { $t } from '@/locales'
import { m } from 'vue-router/dist/router-CWoNjPRp.mjs'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MenuService.list,
    dialogTitle: '菜单',
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
        label: '菜单名称',
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
        label: '唯一编码',
        width: 200,
      },
      {
        prop: 'type',
        label: '菜单类型',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_MENU_TYPE,
        }
      },
      {
        prop: 'path',
        label: '路由/接口地址'
      },
      {
        prop: 'component',
        label: '组件地址'
      },
      {
        prop: 'sort',
        label: '排序'
      },
      {
        prop: 'enabled',
        label: '是否启用',
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
          label: '菜单ID',
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },

        // 菜单类型
        {
          label: '菜单类型',
          prop: 'type',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 12,
          rules: [],
          componentProps: {
            placeholder: '请选择菜单类型',
            code: DictEnum.SYS_MENU_TYPE,
            isBtn: true,
            renderType: 'RadioGroup'
          }
        },

        // 所属上级
        {
          label: '所属上级',
          prop: 'pid',
          component: 'ApiTreeSelect',
          colSpan: 12,
          componentProps: {
            placeholder: '请选择所属上级',
            clearable: true,
            // 任意节点可选 
            checkStrictly: true,
            api: '/system/menu',
            params: { format: 'tree' },
            labelField: 'name',
            valueField: 'id'
          }
        },

        // 菜单名称
        {
          label: '菜单名称',
          prop: 'title',
          component: 'Input',
          colSpan: 12,
          rules: [
            {
              required: true,
              message: '请输入菜单名称'
            }
          ],
          componentProps: {
            placeholder: '请输入菜单名称',
            clearable: true
          }
        },

        // 唯一编码
        {
          label: '唯一编码',
          prop: 'code',
          component: 'Input',
          colSpan: 12,
          rules: [
            {
              required: true,
              message: '请输入唯一编码'
            }
          ],
          componentProps: {
            placeholder: '请输入唯一编码',
            clearable: true
          }
        },

        // 路由/接口地址
        {
          label: '路由/接口地址',
          prop: 'path',
          component: 'Input',
          colSpan: 12,
          helpMessage: 'route.path',
          componentProps: (values) => {
            return {
              placeholder: '请输入路由/接口地址',
              clearable: true,
              disabled: ![1, 2, 4].includes(values.type)
            }
          }
        },

        // 组件地址
        {
          label: '组件地址',
          prop: 'component',
          component: 'Input',
          colSpan: 12,
          componentProps: (values) => {
            return {
              placeholder: '请输入组件地址',
              clearable: true,
              disabled: ![1, 2].includes(values.type)
            }
          }
        },

        // 打开方式
        {
          label: '打开方式',
          prop: 'openType',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 12,
          componentProps: (values) => {
            return {
              placeholder: '请选择打开方式',
              code: 'sys_menu_open_type',
              isBtn: true,
              renderType: 'RadioGroup',
              disabled: values.type !== 2
            }
          }
        },

        // 图标
        {
          label: '图标',
          prop: 'icon',
          component: 'IconPicker',
          colSpan: 12,
          componentProps: (values) => {
            return {
              class: 'w-full',
              placeholder: '请选择图标',
              clearable: true,
              disabled: ![1, 2].includes(values.type)
            }
          }
        },

        // 内外链地址
        {
          label: '内外链地址',
          prop: 'url',
          component: 'Input',
          colSpan: 12,
          helpMessage: 'url',
          componentProps: (values) => {
            return {
              placeholder: '请输入内外链地址',
              clearable: true,
              disabled: ![2, 3].includes(values.openType)
            }
          }
        },

        // 排序
        {
          label: '排序',
          prop: 'sort',
          component: 'InputNumber',
          colSpan: 12,
          defaultValue: 999,
          componentProps: {
            placeholder: '请输入排序',
            clearable: true
          }
        },

        // 是否启用
        {
          label: '是否启用',
          prop: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 6,
          componentProps: {
            placeholder: '请选择是否启用',
            code: 'yes_no',
            isBtn: true,
            renderType: 'RadioGroup'
          }
        },

        // 是否显示
        {
          label: '是否显示',
          prop: 'isShow',
          component: 'ApiDict',
          defaultValue: 1,
          colSpan: 6,
          componentProps: (values) => {
            return {
              placeholder: '请选择是否显示',
              code: 'yes_no',
              isBtn: true,
              renderType: 'RadioGroup',
              disabled: ![1, 2].includes(values.type)
            }
          }
        },

        // 是否同步
        {
          label: '是否同步',
          prop: 'isSync',
          component: 'ApiDict',
          defaultValue: 0,
          colSpan: 6,
          componentProps: {
            placeholder: '请选择是否同步',
            code: 'yes_no',
            isBtn: true,
            renderType: 'RadioGroup'
          }
        },

        // 是否缓存
        {
          label: '是否缓存',
          prop: 'isCache',
          component: 'ApiDict',
          defaultValue: 0,
          colSpan: 6,
          componentProps: (values) => {
            return {
              placeholder: '请选择是否缓存',
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
