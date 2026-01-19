import { CrudSchema } from '@/components/crud'
import { $t } from '@/locales'
import { DictEnum } from '@/app/enums'
import NoticeService from '@/app/api/system/notice'

// crud配置
export const crudSchema = (onActionClick?: Function): CrudSchema => {
  return {
    // 接口地址
    api: NoticeService.list,
    dialogTitle: $t('system.notice.list.title'),
    crudApi: {
      // 新增接口
      add: NoticeService.create,
      // 修改接口
      edit: NoticeService.update,
      // 删除接口
      remove: NoticeService.remove,
      // 详情接口
      view: NoticeService.get
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
    hasView: false,
    // 新增权限码
    addAuth: 'system:notice:create',
    // 删除权限码
    removeAuth: 'system:notice:delete',
    // 修改权限码
    editAuth: 'system:notice:update',
    // 详情权限码
    viewAuth: 'system:notice:read',
    // 表格列定义
    columns: [
      {
        type: 'selection'
      },
      {
        label: $t('system.notice.list.table.columns.type'),
        prop: 'type',
        width: 120,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_NOTICE_TYPE
        },
      },
      {

        label: $t('system.notice.list.table.columns.title'),
        align: 'left',
        prop: 'title',
        minWidth: 110,
      },
      {
        label: $t('system.notice.list.table.columns.content'),
        align: 'left',
        prop: 'content',
        minWidth: 200,
      },
      {
        label: $t('system.notice.list.table.columns.enabled'),
        prop: 'enabled',
        width: 120,
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_YES_NO
        },
      },
      {
        label: $t('system.notice.list.table.columns.created_date'),
        align: 'center',
        prop: 'created_date',
      },
    ],
    // 搜索表单定义
    searchFormSchema: {
      labelWidth: '200px',
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_title',
          label: $t('system.notice.list.query.title'),
          componentProps: {
            placeholder: $t('system.notice.list.query.placeholder.title')
          },
          colSpan: 6
        },
        {
          component: 'ApiDict',
          label: $t('system.notice.list.query.type'),
          componentProps: {
            code: DictEnum.SYS_NOTICE_TYPE,
            placeholder: $t('system.notice.list.query.placeholder.type')
          },
          prop: 'EQ_type',
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
          component: 'Input',
          show: false,
          ifDetail: false,
          colSpan: 24,
          prop: 'id',
          label: $t('system.notice.form.modal.id'),
        },
        {
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_NOTICE_TYPE,
            class: 'w-full'
          },
          prop: 'type',
          label: $t('system.notice.form.modal.type'),
          rules: [{
            required: true,
          }],
          colSpan: 24,
        },
        {
          component: 'Input',
          prop: 'title',
          label: $t('system.notice.form.modal.title'),
          rules: [{
            required: true,
          }],
          colSpan: 24,
        },
        {
          component: 'Input',
          componentProps: {
            type: 'textarea',
            width: '100%',
            rows: 6
          },
          prop: 'content',
          label: $t('system.notice.form.modal.content'),
          rules: [{
            required: true,
          }],
          colSpan: 24,
        },
        {
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_YES_NO,
            class: 'w-full'
          },
          defaultValue: 1,
          prop: 'enabled',
          label: $t('system.notice.form.modal.enabled'),
        },
      ]
    }
  }
}