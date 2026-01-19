import { CrudSchema } from '@/components/crud'
import { DictService } from '@/app/api/system/dict'
import { DictEnum } from '@/app/enums'
import { $t } from '@/locales'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: DictService.list,
    dialogTitle: '字典',
    crudApi: {
      // 新增接口
      add: DictService.create,
      // 修改接口
      edit: DictService.update,
      // 删除接口
      remove: DictService.remove,
      // 详情接口
      view: DictService.detail
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
    addAuth: 'system:dict:create',
    // 删除权限码
    removeAuth: 'system:dict:delete',
    // 修改权限码
    editAuth: 'system:dict:update',
    // 详情权限码
    viewAuth: 'system:dict:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'group_code',
        label: $t('system.dict.list.table.columns.group_code'),
        component: 'ApiDict',
        minWidth: 200,
        componentProps: {
          code: DictEnum.SYS_DICT_GROUP_CODE
        }
      },
      {
        prop: 'name',
        label: $t('system.dict.list.table.columns.name'),
        minWidth: 200
      },
      {
        prop: 'code',
        label: $t('system.dict.list.table.columns.code'),
        minWidth: 200
      },
      {
        prop: 'data_type',
        label: $t('system.dict.list.table.columns.data_type'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_DICT_DATA_TYPE
        },
        minWidth: 100
      },
      {
        prop: 'sort',
        label: $t('system.dict.list.table.columns.sort'),
        minWidth: 100
      },
      {
        prop: 'enabled',
        label: $t('system.dict.list.table.columns.enabled'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        },
        minWidth: 100
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      schema: [
        {
          label: $t('system.dict.list.query.group_code'),
          prop: 'IN_groupCode',
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_DICT_GROUP_CODE,
            clearable: true,
            placeholder: $t('system.dict.list.query.placeholder.group_code'),
            multiple: true
          },
          colSpan: 6
        },
        {
          prop: 'LIKE_name',
          label: $t('system.dict.list.query.name'),
          component: 'Input',
          componentProps: {
            clearable: true,
            placeholder: $t('system.dict.list.query.placeholder.name')
          },
          colSpan: 6
        },
        {
          prop: 'LIKE_code',
          label: $t('system.dict.list.query.code'),
          component: 'Input',
          componentProps: {
            clearable: true,
            placeholder: $t('system.dict.list.query.placeholder.code')
          },
          colSpan: 6
        },
        {
          label: $t('system.dict.list.query.enabled'),
          prop: 'IN_enabled',
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
            placeholder: $t('system.dict.list.query.placeholder.enabled')
          },
          colSpan: 6
        }
      ]
    },
    // 内置弹窗配置
    dialogProps: {
      width: '50%'
    },
    // crud表单配置
    formSchema: {
      showDefaultActions: false,
      labelWidth: '100px',
      schema: [
        {
          label: $t('system.dict.form.modal.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          label: $t('system.dict.form.modal.group_code'),
          prop: 'group_code',
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_DICT_GROUP_CODE
          },
          rules: [
            {
              required: true,
              message: $t('system.dict.form.modal.placeholder.group_code')
            }
          ],
          colSpan: 24
        },
        {
          label: $t('system.dict.form.modal.name'),
          prop: 'name',
          component: 'Input',
          rules: [
            {
              required: true,
              message: $t('system.dict.form.modal.placeholder.name')
            }
          ],
          componentProps: {
            placeholder: $t('system.dict.form.modal.placeholder.name')
          },
          colSpan: 24
        },
        {
          label: $t('system.dict.form.modal.code'),
          prop: 'code',
          component: 'Input',
          rules: [
            {
              required: true,
              message: $t('system.dict.form.modal.placeholder.code')
            }
          ],
          componentProps: {
            placeholder: $t('system.dict.form.modal.placeholder.code')
          },
          colSpan: 24
        },

        {
          label: $t('system.dict.form.modal.data_type'),
          prop: 'data_type',
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_DICT_DATA_TYPE,
            renderType: 'RadioGroup',
            isBtn: true
          },
          rules: [],
          colSpan: 24
        },
        {
          label: $t('system.dict.form.modal.enabled'),
          prop: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            renderType: 'RadioGroup',
            isBtn: true
          },
          rules: [],
          colSpan: 24
        },
        {
          label: $t('system.dict.form.modal.sort'),
          prop: 'sort',
          component: 'InputNumber',
          defaultValue: 0,
          componentProps: {},
          colSpan: 24
        },
        {
          label: $t('system.dict.form.modal.remark'),
          prop: 'remark',
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('system.dict.form.modal.placeholder.remark')
          },
          colSpan: 24
        }
      ]
    }
  }
}
