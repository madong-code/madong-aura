import { MenuService } from '@/api/sys/menu'
import { CrudSchema } from '@/components/crud'
import { Icon } from '@/components/icon'

// crud配置
export const crudSchema: CrudSchema = {
  // 接口地址
  api: MenuService.tree,
  dialogTitle: '菜单',
  crudApi: {
    // 新增接口
    add: MenuService.save,
    // 修改接口
    edit: MenuService.update,
    // 删除接口
    remove: MenuService.remove,
    // 详情接口
    view: MenuService.detail
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
  addAuth: 'sys:menu:save',
  // 删除权限码
  removeAuth: 'sys:menu:remove',
  // 修改权限码
  editAuth: 'sys:menu:update',
  // 详情权限码
  viewAuth: 'sys:menu:detail',
  rowKey: 'id',
  // 表格列定义
  columns: [
    {
      prop: 'name',
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
                row.name
              )
            ])
          : h('span', {}, row.name)
      }
    },
    {
      prop: 'code',
      label: '唯一编码'
    },
    {
      prop: 'type',
      label: '菜单类型',
      component: 'ApiDict',
      componentProps: {
        code: 'sys_menu_type'
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
  // 搜索表单定义
  searchFormSchema: {
    schema: [
      {
        prop: 'm_LIKE_name',
        label: '菜单名称',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入菜单名称'
        },
        colSpan: 6
      },
      {
        prop: 'm_LIKE_code',
        label: '唯一编码',
        component: 'Input',
        componentProps: {
          clearable: true,
          placeholder: '请输入唯一编码'
        },
        colSpan: 6
      },
      {
        prop: 'm_EQ_enabled',
        label: '是否启用',
        component: 'ApiDict',
        componentProps: {
          clearable: true,
          code: 'yes_no',
          placeholder: '请选择',
          renderType: 'Select'
        },
        colSpan: 6
      }
    ]
  },
  // 内置弹窗配置
  dialogProps: {
    width: '60%',
    dialogType: 'dialog'
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
        rules: [
          {
            required: true,
            message: '请选择菜单类型'
          }
        ],
        componentProps: {
          placeholder: '请选择菜单类型',
          code: 'sys_menu_type',
          isBtn: true,
          renderType: 'RadioGroup'
        }
      },

      // 所属上级
      {
        label: '所属上级',
        prop: 'parentId',
        component: 'ApiTreeSelect',
        colSpan: 12,
        componentProps: {
          placeholder: '请选择所属上级',
          clearable: true,
          // 任意节点可选
          checkStrictly: true,
          api: '/sys/menu/tree',
          labelField: 'name',
          valueField: 'id'
        }
      },

      // 菜单名称
      {
        label: '菜单名称',
        prop: 'name',
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
