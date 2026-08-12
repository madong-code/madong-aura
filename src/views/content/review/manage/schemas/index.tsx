import type { CrudSchema } from '#/components/crud/components/types';

import { reviewManageService } from '#/api/content/review/manage';
import { $t } from '#/locales';

export const REVIEW_STATUS_OPTIONS = [
  {
    value: 0,
    label: $t('content.review.manage.status.pending'),
    color: 'warning',
  },
  {
    value: 4,
    label: $t('content.review.manage.status.processing'),
    color: 'primary',
  },
  {
    value: 1,
    label: $t('content.review.manage.status.approved'),
    color: 'success',
  },
  {
    value: 2,
    label: $t('content.review.manage.status.rejected'),
    color: 'danger',
  },
  {
    value: 3,
    label: $t('content.review.manage.status.cancelled'),
    color: 'info',
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
      title: $t('content.review.manage.table.columns.id'),
      width: 80,
      visible: false,
    },
    {
      field: 'title',
      title: $t('content.review.manage.table.columns.title'),
      minWidth: 200,
      align: 'left',
      showOverflowTooltip: true,
      formatter: ({ row }: any) => row.title ?? '-',
    },
    {
      field: 'display_name',
      title: $t('content.review.manage.table.columns.type'),
      width: 160,
      align: 'left',
      formatter: ({ row }: any) =>
        row.display_name ?? row.morph_alias ?? row.reviewable_type ?? '-',
    },
    {
      field: 'content',
      title: $t('content.review.manage.table.columns.summary'),
      minWidth: 240,
      align: 'left',
      showOverflowTooltip: true,
      formatter: ({ row }: any) => row.content ?? '-',
    },
    {
      field: 'status',
      title: $t('content.review.manage.table.columns.status'),
      width: 100,
      align: 'center',
      vxeColumn: {
        cellRender: {
          name: 'CellTag',
          attrs: { options: REVIEW_STATUS_OPTIONS },
        },
      },
    },
    {
      field: 'applicant',
      title: $t('content.review.manage.table.columns.applicant'),
      width: 120,
      align: 'left',
      formatter: ({ row }: any) => row.applicant ?? '-',
    },
    {
      field: 'created_at',
      title: $t('content.review.manage.table.columns.created_at'),
      width: 140,
      align: 'center',
      formatter: 'formatDateTime',
    },
  ];

  return {
    crudApi: {
      list: reviewManageService.list,
      view: reviewManageService.detail,
    },
    rowKey: 'id',
    hasAdd: false,
    hasEdit: false,
    hasRemove: false,
    hasView: false,
    hasBatchRemove: false,
    columns,
    searchForm: {
      schema: [
        {
          fieldName: 'keyword',
          label: $t('content.review.manage.table.search.keyword'),
          component: 'Input',
          componentProps: {
            placeholder: $t(
              'content.review.manage.table.search.keyword_placeholder',
            ),
          },
        },
        {
          fieldName: 'status',
          label: $t('content.review.manage.table.search.status'),
          component: 'Select',
          componentProps: {
            options: REVIEW_STATUS_OPTIONS,
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
    tableActionColumn: { width: '170px', align: 'center' },
    permissions: {
      view: 'content:review:manage:read',
      add: 'content:review:manage:approve',
      edit: 'content:review:manage:reject',
      remove: 'content:review:manage:cancel',
    },
  };
}
