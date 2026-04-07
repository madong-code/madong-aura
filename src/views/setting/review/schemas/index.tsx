import { CrudSchema } from '@/components/crud'
import { ReviewService } from '@/api/setting/review'
import { DictEnum } from '@/enums'
import { $t } from '@/locales'
import { fa } from 'element-plus/es/locale'
import { formatDateTime } from '@/utils'

// crud配置
export const crudSchema = (): CrudSchema => {
  return {
    api: ReviewService.list,
    dialogTitle: $t('setting.review.title'),
    crudApi: {
      add: ReviewService.create,
      edit: ReviewService.update,
      remove: ReviewService.remove,
      view: ReviewService.get
    },
    useCrud: true,
    hasAdd: false,
    hasRemove: false,
    hasEdit: false,
    hasView: false,
    addAuth: 'setting:review:create',
    removeAuth: 'setting:review:delete',
    editAuth: 'setting:review:update',
    viewAuth: 'setting:review:read',
    rowKey: 'id',

    useSearchForm: true,

    columns: [
      {
        type: 'selection'
      },
      {
        prop: 'id',
        label: $t('setting.review.list.table.columns.id'),
        minWidth: 170,
        visible: false
      },
      {
        prop: 'title',
        label: $t('setting.review.list.table.columns.title'),
        minWidth: 150
      },
      // {
      //   prop: 'type',
      //   label: $t('setting.review.list.table.columns.type'),
      //   component: 'ApiDict',
      //   componentProps: {
      //     code: DictEnum.REVIEW_TYPE,
      //     clearable: true
      //   }
      // },
      {
        prop: 'status',
        label: $t('setting.review.list.table.columns.status'),
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.REVIEW_STATUS,
          clearable: true
        }
      },
      {
        prop: 'applicant',
        label: $t('setting.review.list.table.columns.applicant'),
        minWidth: 100
      },
      {
        prop: 'reviewer.real_name',
        label: $t('setting.review.list.table.columns.reviewer'),
        minWidth: 100,
        formatter(row) {
          return row.reviewer?.real_name || '/'
        }
      },
      {
        prop: 'created_at',
        label: $t('setting.review.list.table.columns.created_at'),
        formatter(row) {
          return formatDateTime(row.created_at)
        },
        minWidth: 180
      },
      {
        prop: 'reviewed_at',
        label: $t('setting.review.list.table.columns.reviewed_at'),
        minWidth: 180,
        formatter(row) {
          return formatDateTime(row.reviewed_at)
        }
      }
    ],

    searchFormSchema: {
      schema: [
        {
          component: 'Input',
          prop: 'LIKE_extra_data',
          label: $t('setting.review.list.query.title'),
          componentProps: {
            placeholder: $t('setting.review.list.query.placeholder.title')
          },
          colSpan: 6
        },
        {
          component: 'ApiDict',
          prop: 'type',
          label: $t('setting.review.list.query.type'),
          componentProps: {
            code: DictEnum.REVIEW_TYPE,
            clearable: true,
            placeholder: $t('setting.review.list.query.placeholder.type')
          },
          colSpan: 6
        },
        {
          component: 'ApiDict',
          prop: 'status',
          label: $t('setting.review.list.query.status'),
          componentProps: {
            code: DictEnum.REVIEW_STATUS,
            clearable: true,
            placeholder: $t('setting.review.list.query.placeholder.status')
          },
          colSpan: 6
        },
        {
          component: 'Input',
          prop: 'LIKE_applicant',
          label: $t('setting.review.list.query.applicant'),
          componentProps: {
            placeholder: $t('setting.review.list.query.placeholder.applicant')
          },
          colSpan: 6
        }
      ]
    },

    dialogProps: {
      width: '50%'
    },

    formSchema: {
      showDefaultActions: true,
      labelWidth: '100px',
      schema: [
        {
          label: $t('setting.review.form.modal.id'),
          prop: 'id',
          component: 'Input',
          colSpan: 24,
          show: false,
          ifDetail: false
        },
        {
          label: $t('setting.review.form.modal.title'),
          prop: 'title',
          component: 'Input',
          componentProps: {
            placeholder: $t('setting.review.form.modal.placeholder.title')
          },
          colSpan: 24,
          rules: [
            {
              required: true,
              message: $t('setting.review.form.modal.placeholder.title')
            }
          ]
        },
        {
          label: $t('setting.review.form.modal.type'),
          prop: 'type',
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.REVIEW_TYPE,
            clearable: true,
            placeholder: $t('setting.review.form.modal.placeholder.type')
          },
          colSpan: 24,
          rules: [
            {
              required: true,
              message: $t('setting.review.form.modal.placeholder.type')
            }
          ]
        },
        {
          label: $t('setting.review.form.modal.content'),
          prop: 'content',
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 5,
            placeholder: $t('setting.review.form.modal.placeholder.content')
          },
          colSpan: 24,
          rules: [
            {
              required: true,
              message: $t('setting.review.form.modal.placeholder.content')
            }
          ]
        },
        {
          label: $t('setting.review.form.modal.status'),
          prop: 'status',
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.REVIEW_STATUS,
            clearable: true,
            placeholder: $t('setting.review.form.modal.placeholder.status')
          },
          colSpan: 24
        },
        {
          label: $t('setting.review.form.modal.review_note'),
          prop: 'review_note',
          component: 'Input',
          componentProps: {
            type: 'textarea',
            rows: 3,
            placeholder: $t('setting.review.form.modal.placeholder.review_note')
          },
          colSpan: 24
        }
      ]
    }
  }
}
