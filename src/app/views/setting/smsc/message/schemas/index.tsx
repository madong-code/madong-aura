import { CrudSchema } from '@/components/crud'
import { MessageService } from '@/app/api/network/message'
import { $t } from '@/locales'
import { DictEnum } from '@/app/enums'



// crud配置
export const crudSchema = (onActionClick?: Function): CrudSchema => {
  return {
    // 接口地址
    api: MessageService.list,
    dialogTitle: $t('system.message.list.dialog.title'),
    crudApi: {
      // 新增接口
      add: MessageService.create,
      // 修改接口
      edit: MessageService.update,
      // 删除接口
      remove: MessageService.remove,
      // 详情接口
      view: MessageService.get
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
    addAuth: 'system:message:create',
    // 删除权限码
    removeAuth: 'system:message:delete',
    // 修改权限码
    editAuth: 'system:message:update',
    // 详情权限码
    viewAuth: 'system:message:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        label: $t('system.message.list.table.columns.priority'),
        align: 'left',
        prop: 'priority',
        width: 70,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_MESSAGE_PRIORITY
        }
      },
      {
        label: $t('system.message.list.table.columns.related_id'),
        align: 'left',
        prop: 'related_id',
        minWidth: 150,
        visible: false,
        formatter: (row) => {
          if (row.related_id == undefined || row.related_id == '' || row.related_id == null) {
            return '/';
          }
          return h(ElButton, {
            type: 'text',
            onClick: (event: { stopPropagation: () => void; }) => {
              event.stopPropagation()
              if (onActionClick) {
                onActionClick({ code: 'action', row })
              }
            },
            style: {
              paddingLeft: '0',
              paddingRight: '0',
              fontSize: '13px'
            },
          }, row.related_id)
        }
      },
      {
        label: $t('system.message.list.table.columns.title'),
        align: 'left',
        prop: 'title',
        minWidth: 170,
        formatter: (row) => {
          return h(ElButton, {
            type: 'text',
            onClick: (event: { stopPropagation: () => void; }) => {
              event.stopPropagation()
              if (onActionClick) {
                onActionClick({ code: 'read', row })
              }
            },
            style: {
              paddingLeft: '0',
              paddingRight: '0',
              fontSize: '13px'
            },
          }, row.title)
        }
      },
      {
        align: 'left',
        label: $t('system.message.list.table.columns.content'),
        prop: 'content',
        minWidth: 250
      },
      {
        label: $t('system.message.list.table.columns.status'),
        prop: 'status',
        width: 100,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_MESSAGE_STATUS
        }
      },
      {
        label: $t('system.message.list.table.columns.type'),
        prop: 'type',
        width: 100,
        visible: false,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_MESSAGE_TYPE
        }
      },
      {
        width: 150,
        label: $t('system.message.list.table.columns.sender.real_name'),
        prop: 'sender.real_name',
        formatter: (row) => {
          const { sender } = row;
          return sender?.real_name || 'Administrator'
        }
      },
      {
        label: $t('system.message.list.table.columns.created_date'),
        prop: 'created_date',
        align: 'center',
        minWidth: 170
      },
      {
        label: $t('system.message.list.table.columns.read_date'),
        prop: 'read_date',
        minWidth: 170,
        align: 'center',
        formatter: (row) => {
          const { read_date } = row;
          return read_date || '/'
        }
      }
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_title',
          label: $t('system.message.list.query.title'),
          componentProps: {
            placeholder: $t('system.message.list.query.placeholder.title'),
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'LIKE_content',
          label: $t('system.message.list.query.content'),
          componentProps: {
            placeholder: $t('system.message.list.query.placeholder.content'),
          },
          colSpan: 6
        },
        {
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_MESSAGE_STATUS,
            placeholder: $t('system.message.list.query.placeholder.enabled'),
          },
          prop: 'EQ_status',
          label: $t('system.message.list.query.enabled'),
          colSpan: 6
        },
        {
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_MESSAGE_PRIORITY,
            placeholder: $t('system.message.list.query.placeholder.priority'),
          },
          prop: 'EQ_priority',
          label: $t('system.message.list.query.priority'),
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
          label: $t('system.message.form.modal.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          label: $t('system.message.form.modal.title'),
          prop: 'title',
          component: 'Input',
          rules: [
            {
              required: true,
              message: $t('system.message.form.modal.placeholder.title')
            }
          ],
          componentProps: {
            placeholder: $t('system.message.form.modal.placeholder.title')
          },
          colSpan: 24
        },
        {
          label: $t('system.message.form.modal.content'),
          prop: 'content',
          component: 'Input',
          componentProps: {
            type: 'textarea',
            placeholder: $t('system.message.form.modal.placeholder.content'),
            rows: 4
          },
          colSpan: 24
        },
        {
          label: $t('system.message.form.modal.status'),
          prop: 'status',
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_MESSAGE_STATUS,
            isBtn: true,
            renderType: 'RadioGroup'
          },
          rules: [],
          colSpan: 24
        },
        {
          label: $t('system.message.form.modal.priority'),
          prop: 'priority',
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_MESSAGE_PRIORITY,
            isBtn: true,
            renderType: 'RadioGroup'
          },
          rules: [],
          colSpan: 24
        },
        {
          label: $t('system.message.form.modal.type'),
          prop: 'type',
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_MESSAGE_TYPE,
            isBtn: true,
            renderType: 'RadioGroup'
          },
          rules: [],
          colSpan: 24
        },
        {
          label: $t('system.message.form.modal.remark'),
          prop: 'remark',
          component: 'Input',
          componentProps: {
            type: 'textarea',
            placeholder: $t('system.message.form.modal.placeholder.remark')
          },
          colSpan: 24
        }
      ]
    }
  }
}