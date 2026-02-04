import { MenuService } from '@/app/api/web'  
import { CrudSchema } from '@/components/crud'
import { Icon } from '@/components/icon'
import { $t } from '@/locales'
import { h } from 'vue'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: MenuService.list,
    dialogTitle: $t('web.menu.pageTitle'),
    tree: {
      id: 'id',
      pid: 'parent_id'
    },
    crudApi: {
      // 新增接口
      add: MenuService.add,
      // 修改接口
      edit: MenuService.edit,
      // 删除接口
      remove: MenuService.delete,
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
        },
        minWidth: 200
      },
      {
        prop: 'type',
        label: '菜单类型',
        minWidth: 100,
        cellRender: {
          name: 'CellText',
          props: {
            value: (row: any) => {
              const typeMap = {
                1: '导航菜单',
                2: '外部链接',
                3: '单页面'
              }
              return typeMap[row.type] || row.type
            }
          }
        }
      },
      {
        prop: 'url',
        label: '链接地址',
        minWidth: 150
      },
      {
        prop: 'icon',
        label: '图标',
        minWidth: 100
      },
      {
        prop: 'target',
        label: '打开方式',
        minWidth: 100,
        cellRender: {
          name: 'CellText',
          props: {
            value: (row: any) => {
              const targetMap = {
                1: '当前窗口',
                2: '新窗口'
              }
              return targetMap[row.target] || row.target
            }
          }
        }
      },
      {
        prop: 'is_show',
        label: '是否显示',
        minWidth: 100,
        cellRender: {
          name: 'CellTag',
          props: {
            type: (row: any) => (row.is_show ? 'success' : 'danger'),
            value: (row: any) => (row.is_show ? '是' : '否')
          }
        }
      },
      {
        prop: 'status',
        label: '状态',
        minWidth: 100,
        cellRender: {
          name: 'CellTag',
          props: {
            type: (row: any) => (row.status ? 'success' : 'danger'),
            value: (row: any) => (row.status ? '启用' : '禁用')
          }
        }
      },
      {
        prop: 'sort',
        label: '排序',
        minWidth: 80
      }
    ],
    // 内置弹窗配置
    dialogProps: {
      width: '600px',
      dialogType: 'drawer'
    },
    // 搜索表单配置
    searchFormSchema: {
      labelWidth: '120px',
      schema: [
        {
          prop: 'name',
          label: '菜单名称',
          component: 'Input',
          colSpan: 8
        },
        {
          prop: 'type',
          label: '菜单类型',
          component: 'Select',
          componentProps: {
            options: [
              { label: '导航菜单', value: 1 },
              { label: '外部链接', value: 2 },
              { label: '单页面', value: 3 }
            ],
            clearable: true
          },
          colSpan: 8
        }
      ]
    },
    // crud表单配置
    formSchema: {
      showDefaultActions: true,
      labelWidth: '130px',
      schema: [
        // 菜单ID（隐藏字段）
        {
          label: 'ID',
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        // 菜单名称
        {
          label: '菜单名称',
          prop: 'name',
          component: 'Input',
          colSpan: 24,
          rules: [{ required: true, message: '请输入菜单名称' }],
          componentProps: {
            placeholder: '请输入菜单名称',
            clearable: true
          }
        },
        // 菜单类型
        {
          label: '菜单类型',
          prop: 'type',
          component: 'Select',
          defaultValue: 1,
          colSpan: 24,
          rules: [{ required: true, message: '请选择菜单类型' }],
          componentProps: {
            placeholder: '请选择菜单类型',
            options: [
              { label: '导航菜单', value: 1 },
              { label: '外部链接', value: 2 },
              { label: '单页面', value: 3 }
            ],
            clearable: false
          }
        },
        // 父菜单
        {
          label: '父菜单',
          prop: 'parent_id',
          component: 'Select',
          colSpan: 24,
          componentProps: {
            placeholder: '请选择父菜单',
            options: [],
            clearable: true
          }
        },
        // 链接地址
        {
          label: '链接地址',
          prop: 'url',
          component: 'Input',
          colSpan: 24,
          componentProps: {
            placeholder: '请输入链接地址',
            clearable: true
          }
        },
        // 图标
        {
          label: '图标',
          prop: 'icon',
          component: 'Input',
          colSpan: 24,
          componentProps: {
            placeholder: '请输入图标类名',
            clearable: true
          }
        },
        // 打开方式
        {
          label: '打开方式',
          prop: 'target',
          component: 'Select',
          defaultValue: 1,
          colSpan: 24,
          componentProps: {
            placeholder: '请选择打开方式',
            options: [
              { label: '当前窗口', value: 1 },
              { label: '新窗口', value: 2 }
            ],
            clearable: false
          }
        },
        // 是否显示
        {
          label: '是否显示',
          prop: 'is_show',
          component: 'Switch',
          defaultValue: 1,
          colSpan: 24
        },
        // 状态
        {
          label: '状态',
          prop: 'status',
          component: 'Switch',
          defaultValue: 1,
          colSpan: 24
        },
        // 排序
        {
          label: '排序',
          prop: 'sort',
          component: 'InputNumber',
          defaultValue: 999,
          colSpan: 24,
          componentProps: {
            placeholder: '请输入排序',
            clearable: true,
            min: 0
          }
        }
      ]
    }
  }
}
