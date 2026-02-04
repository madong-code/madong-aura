import { CrudSchema } from '@/components/crud';
import { LinkService } from '@/app/api/web';
import { $t } from '@/locales';

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: LinkService.list,
    dialogTitle: $t('web.link.pageTitle'),
    crudApi: {
      // 新增接口
      add: LinkService.add,
      // 修改接口
      edit: LinkService.edit,
      // 删除接口
      remove: LinkService.delete,
      // 详情接口
      view: LinkService.detail
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
    addAuth: 'web:link:add',
    // 删除权限码
    removeAuth: 'web:link:delete',
    // 修改权限码
    editAuth: 'web:link:edit',
    // 详情权限码
    viewAuth: 'web:link:detail',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'name',
        label: '链接名称',
        minWidth: 120
      },
      {
        prop: 'url',
        label: '链接地址',
        minWidth: 200
      },
      {
        prop: 'logo',
        label: '链接图标',
        minWidth: 150
      },
      {
        prop: 'sort',
        label: '排序',
        minWidth: 80
      },
      {
        prop: 'status',
        label: '状态',
        minWidth: 100,
        cellRender: {
          name: 'CellTag',
          props: {
            type: (row: any) => (row.status === 1 ? 'success' : 'danger'),
            value: (row: any) => (row.status === 1 ? '启用' : '禁用')
          }
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
          prop: 'name',
          label: '链接名称',
          component: 'Input',
          colSpan: 8
        },
        {
          prop: 'status',
          label: '状态',
          component: 'Select',
          componentProps: {
            options: [
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 }
            ],
            clearable: true
          },
          colSpan: 8
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
          label: '链接名称',
          component: 'Input',
          rules: [{ required: true, message: '请输入链接名称' }],
          componentProps: {
            placeholder: '请输入链接名称'
          },
          colSpan: 24
        },
        {
          prop: 'url',
          label: '链接地址',
          component: 'Input',
          rules: [{ required: true, message: '请输入链接地址' }],
          componentProps: {
            placeholder: '请输入链接地址'
          },
          colSpan: 24
        },
        {
          prop: 'logo',
          label: '链接图标',
          component: 'Input',
          componentProps: {
            placeholder: '请输入链接图标地址'
          },
          colSpan: 24
        },
        {
          prop: 'sort',
          label: '排序',
          component: 'InputNumber',
          componentProps: {
            min: 0
          },
          colSpan: 24
        },
        {
          prop: 'status',
          label: '状态',
          component: 'Switch',
          defaultValue: 1,
          componentProps: {
            checkedChildren: '启用',
            unCheckedChildren: '禁用'
          },
          colSpan: 24
        }
      ]
    }
  }
};
