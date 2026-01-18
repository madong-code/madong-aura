import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { } from '@/api/dev/gateway'
import { RecycleBinService } from '@/api/system/recycle-bin'
import { DictEnum } from '@/app/enums'


// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    // 接口地址
    api: RecycleBinService.list,
    dialogTitle: $t('system.recycle_bin.list.title'),
    crudApi: {
      // 新增接口
      add: RecycleBinService.create,
      // 修改接口
      edit: RecycleBinService.update,
      // 删除接口
      remove: RecycleBinService.remove,
      // 详情接口
      view: RecycleBinService.get
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
    hasView: true,
    // 新增权限码
    addAuth: 'system:recycle_bin:create',
    // 删除权限码
    removeAuth: 'system:recycle_bin:delete',
    // 修改权限码
    editAuth: 'system:recycle_bin:update',
    // 详情权限码
    viewAuth: 'system:recycle_bin:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },

      {
        prop: 'table_name',
        label: $t('system.recycle_bin.list.table.columns.table_name'),
        align: 'center'
      },
      {
        prop: 'data',
        label: $t('system.recycle_bin.list.table.columns.data'),
        formatter(row) {
          const jsonString = JSON.stringify(row.data, null, 2);
          return jsonString;
        }
      },
      { prop: 'ip', label: 'IP' },
      {
        prop: 'enabled',
        label: $t('system.recycle_bin.list.table.columns.enabled'),
        width: 90,
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        },
      },
      {
        prop: 'created_date',
        label: $t('system.recycle_bin.list.table.columns.created_date'),
        width: 150
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_table_name',
          label: $t('system.recycle_bin.list.query.table_name'),
          componentProps: {
            placeholder: $t('system.recycle_bin.list.query.placeholder.table_name'),
            allowClear: true,
          },
        },
        // {
        //   component: 'Input',
        //   prop: 'ip',
        //   label: 'ip',
        //   componentProps: {
        //     allowClear: true,
        //   },
        // },
        {
          component: 'ApiDict',
          prop: 'EQ_enabled',
          label: $t('system.recycle_bin.list.query.enabled'),
          componentProps: {
            placeholder: $t('system.recycle_bin.list.query.placeholder.enabled'),
            code: DictEnum.SYS_YES_NO,
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
      schema: [
        {
          prop: 'id',
          label: 'ID',
          component: 'Input',
          ifShow: false,
          ifDetail: false
        },
        {
          prop: 'table_name',
          label: $t('system.recycle_bin.form.modal.table_name'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          }
        },
        {
          prop: 'operate_name',
          label: $t('system.recycle_bin.form.modal.operate_name'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'ip',
          label: $t('system.recycle_bin.form.modal.ip'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'created_date',
          label: $t('system.recycle_bin.form.modal.created_date'),
          component: 'Input',
          componentProps: {
            placeholder: '',
            readOnly: true,
          },
        },
        {
          prop: 'enabled',
          label: $t('system.recycle_bin.form.modal.enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            renderType: 'RadioGroup',
            code: DictEnum.SYS_YES_NO,
          },
        },
        {
          prop: 'data',
          label: $t('system.recycle_bin.form.modal.data'),
          component: 'input',
          componentProps: {
            type: 'textarea',
            placeholder: '',
            readOnly: true,
            autoSize: { minRows: 8, maxRows: 15 }, // 自动高度
            style: {
              backgroundColor: '#f6f8fa',   // 浅灰背景
              border: '1px solid #e0e0e0',  // 边框颜色
              borderRadius: 4,
              fontFamily: 'monospace',       // 等宽字体
              cursor: 'text'                 // 保持文本光标
            }
          },
        }
      ]
    }
  }
}
