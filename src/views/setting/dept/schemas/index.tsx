import { CrudSchema } from '@/components/crud'
import { DeptService } from '@/api/setting/dept'
import { DictEnum } from '@/enums'
import { $t } from '@/locales'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    api: DeptService.list,
    dialogTitle: '部门',
    crudApi: {
      add: DeptService.create,
      edit: DeptService.update,
      remove: DeptService.remove,
      view: DeptService.get
    },
    useCrud: true,
    hasAdd: true,
    hasRemove: true,
    hasEdit: true,
    hasView: true,
    addAuth: 'org:dept:create',
    removeAuth: 'org:dept:delete',
    editAuth: 'org:dept:update',
    viewAuth: 'org:dept:read',

    // 禁用搜索表单，因为树形结构是全量数据
    useSearchForm: true,

    // 树形结构配置
    tree: {
      id: 'id',
      pid: 'pid',
      children: 'children'
    },

    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'name',
        label: $t('setting.dept.list.table.columns.name'),
        component: 'Input'
      },
      {
        prop: 'code',
        label: $t('setting.dept.list.table.columns.code'),
        component: 'Input'
      },
      {
        prop: 'sort',
        label: $t('setting.dept.list.table.columns.sort'),
        component: 'InputNumber'
      },
      {
        prop: 'enabled',
        label: $t('setting.dept.list.table.columns.enabled'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS,
          renderType: 'RadioGroup'
        }
      }
    ],

    searchFormSchema: {
      schema: [
        {
          component: 'Input',
          prop: 'code',
          label: $t('setting.dept.list.query.code'),
          componentProps: {
            placeholder: $t('setting.dept.list.query.placeholder.code')
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'LIKE_name',
          label: $t('setting.dept.list.query.name'),
          componentProps: {
            placeholder: $t('setting.dept.list.query.placeholder.name')
          },
          colSpan: 6
        },

        {
          label: $t('setting.dept.list.query.enabled'),
          prop: 'enabled',
          component: 'ApiDict',
          componentProps: {
            api: '/system/user',
            code: DictEnum.SYS_YES_NO,
            clearable: true,
            placeholder: $t('setting.dept.list.query.placeholder.enabled')
          },
          colSpan: 6
        }
      ]
    },

    dialogProps: {
      width: '50%'
    },

    formSchema: {
      showDefaultActions: false,
      labelWidth: '100px',
      schema: [
        {
          label: $t('setting.dept.form.modal.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          label: $t('setting.dept.form.modal.parent_dept'),
          prop: 'pid',
          component: 'ApiTreeSelect',
          componentProps: {
            api: '/system/dept',
            params: { format: 'select' },
            requestMethod: 'get',
            labelField: 'label',
            valueField: 'value',
            // 任意节点可选
            checkStrictly: true,
            clearable: true,
            placeholder: $t('setting.dept.form.modal.placeholder.parent_dept')
          },
          colSpan: 24,
          rules: [
            // {
            //   required: true,
            //   message: '请选择父级部门'
            // }
          ]
        },
        {
          label: $t('setting.dept.form.modal.name'),
          prop: 'name',
          component: 'Input',
          componentProps: {
            placeholder: $t('setting.dept.form.modal.placeholder.name')
          },
          colSpan: 24,
          rules: [
            {
              required: true,
              message: $t('setting.dept.form.modal.placeholder.name')
            }
          ]
        },
        {
          label: $t('setting.dept.form.modal.code'),
          prop: 'code',
          component: 'Input',
          componentProps: {
            placeholder: $t('setting.dept.form.modal.placeholder.code')
          },
          colSpan: 24,
          rules: [
            {
              required: true,
              message: $t('setting.dept.form.modal.placeholder.code')
            }
          ]
        },
        {
          label: $t('setting.dept.form.modal.code'),
          prop: 'sort',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 9999
          },
          defaultValue: 0,
          colSpan: 24,
          rules: [
            {
              required: true,
              message: $t('setting.dept.form.modal.placeholder.code')
            }
          ]
        },
        {
          label: $t('setting.dept.form.modal.enabled'),
          prop: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true,
            renderType: 'RadioGroup'
          },
          colSpan: 24
        },
        {
          label: $t('setting.dept.form.modal.leader'),
          prop: 'leader_id_list',
          component: 'ApiSelect',
          componentProps: {
            api: '/system/user',
            requestMethod: 'get',
            params: { format: 'select' },
            placeholder: $t('setting.dept.form.modal.placeholder.leader'),
            multiple: true
          },
          colSpan: 24
        },
        {
          label: $t('setting.dept.form.modal.remark'),
          prop: 'remark',
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 3,
            placeholder: $t('setting.dept.form.modal.placeholder.remark')
          },
          colSpan: 24
        }
      ]
    }
  }
}
