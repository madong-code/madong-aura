import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { } from '@/app/api/gateway'
import { FilesService } from '@/app/api/system/files'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: FilesService.list,
    dialogTitle: $t('system.operate_logs.list.title'),
    crudApi: {
      // 新增接口
      add: FilesService.create,
      // 修改接口
      edit: FilesService.update,
      // 删除接口
      remove: FilesService.remove,
      // 详情接口
      view: FilesService.get
    },
    // 使用crud
    useCrud: true,
    // 是否有新增
    hasAdd: false,
    // 是否有删除
    hasRemove: false,
    // 是否有修改
    hasEdit: false,
    // 是否有详情
    hasView: false,
    // 新增权限码
    addAuth: 'system:files:create',
    // 删除权限码
    removeAuth: 'system:files:delete',
    // 修改权限码
    editAuth: 'system:files:update',
    // 详情权限码
    viewAuth: 'system:files:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'filename',
        label: $t('system.files.list.table.columns.filename'),
        align: 'left',
        minWidth: 200
      },
      {
        prop: 'original_filename',
        label: $t('system.files.list.table.columns.original_filename'),
        width: 200
      },
      {
        prop: 'size_info',
        label: $t('system.files.list.table.columns.size_info'),
      },
      {
        prop: 'ext',
        label: $t('system.files.list.table.columns.ext'),
      },
      {
        prop: 'platform',
        label: $t('system.files.list.table.columns.platform'),
      },
      {
        prop: 'created_date',
        label: $t('system.files.list.table.columns.created_date'),
        width: 170
      },
      {
        prop: 'created_name',
        title: $t('system.files.list.table.columns.created_name')
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_filename',
          label: $t('system.files.list.query.filename'),
          componentProps: {
            placeholder: $t('system.files.list.query.placeholder.filename'),
            clearable: true
          },
        },
        {
          component: 'Input',
          prop: 'LIKE_original_filename',
          label: $t('system.files.list.query.original_filename'),
          componentProps: {
            placeholder: $t('system.files.list.query.placeholder.original_filename'),
            clearable: true
          },
        },
        {
          component: 'Input',
          prop: 'LIKE_ext',
          label: $t('system.files.list.query.ext'),
          componentProps: {
            placeholder: $t('system.files.list.query.placeholder.ext'),
            clearable: true
          },
        },
        {
          component: 'Input',
          prop: 'IN_platform',
          label: $t('system.files.list.query.platform'),
          componentProps: {
            placeholder: $t('system.files.list.query.placeholder.platform'),
            clearable: true
          },
        }
      ]
    },
    // 内置弹窗配置
    dialogProps: {
      width: '50%'
    },
    // crud表单配置
    formSchema: {


    }
  }
}