import type { CrudSchema } from '#/components/crud/components/types';

import { reviewLogService } from '#/api/content/review/log';
import { $t } from '#/locales';

export const REVIEW_ACTION_OPTIONS = [
  {
    value: 'submit',
    label: $t('content.review.log.action.submit'),
    color: 'info',
  },
  {
    value: 'approve',
    label: $t('content.review.log.action.approve'),
    color: 'success',
  },
  {
    value: 'reject',
    label: $t('content.review.log.action.reject'),
    color: 'danger',
  },
  {
    value: 'cancel',
    label: $t('content.review.log.action.cancel'),
    color: 'warning',
  },
];

export function useCrudSchema(): CrudSchema {
  const columns: CrudSchema['columns'] = [
    {
      type: 'checkbox',
      width: 60,
      align: 'center',
      fixed: 'left',
    },
    {
      field: 'id',
      title: $t('content.review.log.table.columns.id'),
      width: 80,
      visible: false,
    },
    {
      field: 'title',
      title: $t('content.review.log.table.columns.title'),
      minWidth: 200,
      align: 'left',
      showOverflowTooltip: true,
      formatter: ({ row }: any) => row.title ?? '-',
    },
    {
      field: 'content',
      title: $t('content.review.log.table.columns.content'),
      minWidth: 240,
      align: 'left',
      showOverflowTooltip: true,
      formatter: ({ row }: any) => row.content ?? '-',
    },
    {
      field: 'review_id',
      title: $t('content.review.log.table.columns.review_id'),
      width: 110,
      align: 'right',
      visible: false,
    },
    {
      field: 'action',
      title: $t('content.review.log.table.columns.action'),
      width: 100,
      align: 'center',
      vxeColumn: {
        cellRender: {
          name: 'CellTag',
          attrs: { options: REVIEW_ACTION_OPTIONS },
        },
      },
    },
    {
      field: 'operator_id',
      title: $t('content.review.log.table.columns.operator'),
      width: 130,
      align: 'left',
      formatter: ({ row }: any) => row.operator_id ?? row.created_by ?? '-',
    },
    {
      field: 'reason',
      title: $t('content.review.log.table.columns.reason'),
      minWidth: 200,
      align: 'left',
      showOverflowTooltip: true,
      formatter: ({ row }: any) => row.reason ?? '-',
    },
    {
      field: 'created_at',
      title: $t('content.review.log.table.columns.created_at'),
      width: 140,
      align: 'center',
      formatter: 'formatDateTime',
    },
  ];

  return {
    crudApi: {
      list: reviewLogService.list,
      view: reviewLogService.detail,
      batchRemove: reviewLogService.batchRemove,
    },
    rowKey: 'id',
    hasAdd: false,
    hasEdit: false,
    hasRemove: false,
    hasView: false,
    hasBatchRemove: true,
    columns,
    searchForm: {
      schema: [
        {
          fieldName: 'review_id',
          label: $t('content.review.log.table.search.review_id'),
          component: 'Input',
          componentProps: {
            placeholder: $t(
              'content.review.log.table.search.review_id_placeholder',
            ),
          },
        },
        {
          fieldName: 'action',
          label: $t('content.review.log.table.search.action'),
          component: 'Select',
          componentProps: {
            options: REVIEW_ACTION_OPTIONS,
            allowClear: true,
            placeholder: $t(
              'content.review.log.table.search.action_placeholder',
            ),
          },
        },
      ],
    },
    toolbar: {
      refresh: true,
      search: true,
      custom: true,
      zoom: true,
      export: false,
    },
    formDialog: {
      enabled: true,
    },
    permissions: {
      view: 'content:review:log:list',
      remove: 'content:review:log:delete',
    },
  };
}
