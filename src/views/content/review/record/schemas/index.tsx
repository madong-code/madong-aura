import type { CrudSchema } from '#/components/crud/components/types';

import { reviewRecordService } from '#/api/content/review/record';
import { $t } from '#/locales';

export const REVIEW_STATUS_OPTIONS = [
  {
    value: 0,
    label: $t('content.review.record.status.pending'),
    color: 'warning',
  },
  {
    value: 4,
    label: $t('content.review.record.status.processing'),
    color: 'primary',
  },
  {
    value: 1,
    label: $t('content.review.record.status.approved'),
    color: 'success',
  },
  {
    value: 2,
    label: $t('content.review.record.status.rejected'),
    color: 'danger',
  },
  {
    value: 3,
    label: $t('content.review.record.status.cancelled'),
    color: 'info',
  },
];

function getCurrentMonthRange(): [number, number] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  ).getTime();
  return [start, end];
}

export function useCrudSchema(): CrudSchema {
  const columns: CrudSchema['columns'] = [
    {
      field: 'id',
      title: $t('content.review.record.table.columns.id'),
      width: 80,
      visible: false,
    },
    {
      field: 'title',
      title: $t('content.review.record.table.columns.title'),
      minWidth: 200,
      align: 'left',
      showOverflowTooltip: true,
      formatter: ({ row }: any) => row.title ?? '-',
    },
    {
      field: 'content',
      title: $t('content.review.record.table.columns.summary'),
      minWidth: 240,
      align: 'left',
      showOverflowTooltip: true,
      formatter: ({ row }: any) => row.content ?? '-',
    },
    {
      field: 'display_name',
      title: $t('content.review.record.table.columns.type'),
      width: 110,
      align: 'left',
      formatter: ({ row }: any) =>
        row.display_name ?? row.morph_alias ?? row.reviewable_type ?? '-',
    },
    {
      field: 'status',
      title: $t('content.review.record.table.columns.status'),
      width: 90,
      align: 'center',
      vxeColumn: {
        cellRender: {
          name: 'CellTag',
          attrs: { options: REVIEW_STATUS_OPTIONS },
        },
      },
    },
    {
      field: 'reason',
      title: $t('content.review.record.table.columns.reason'),
      minWidth: 200,
      align: 'left',
      showOverflowTooltip: true,
      formatter: ({ row }: any) => row.reason ?? '-',
    },
    {
      field: 'created_by',
      title: $t('content.review.record.table.columns.applicant'),
      width: 120,
      align: 'left',
      visible: false,
      formatter: ({ row }: any) => row.created_by ?? '-',
    },
    {
      field: 'created_at',
      title: $t('content.review.record.table.columns.created_at'),
      width: 140,
      align: 'center',
      formatter: 'formatDateTime',
    },
  ];

  return {
    crudApi: {
      list: (params: any) => {
        const p = { ...params };
        if (p.BETWEEN_created_at && Array.isArray(p.BETWEEN_created_at)) {
          p.BETWEEN_created_at = p.BETWEEN_created_at.map((t: number) =>
            Math.floor(t / 1000),
          );
        }
        return reviewRecordService.list(p);
      },
      view: reviewRecordService.detail,
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
          fieldName: 'BETWEEN_created_at',
          label: $t('content.review.record.table.search.date_range'),
          component: 'DatePicker',
          defaultValue: getCurrentMonthRange(),
          componentProps: { type: 'daterange', valueFormat: 'x' },
        },
        {
          fieldName: 'reviewable_type',
          label: $t('content.review.record.table.search.type'),
          component: 'ApiSelect',
          componentProps: {
            api: '/content/review/record/types',
            labelField: 'label',
            valueField: 'type',
            allowClear: true,
            placeholder: $t(
              'content.review.record.table.search.type_placeholder',
            ),
          },
        },
        {
          fieldName: 'IN_status',
          label: $t('content.review.record.table.search.status'),
          component: 'Select',
          defaultValue: [1, 2],
          componentProps: {
            options: REVIEW_STATUS_OPTIONS.filter((item) =>
              [1, 2].includes(item.value),
            ),
            multiple: true,
            allowClear: true,
            placeholder: $t(
              'content.review.record.table.search.status_placeholder',
            ),
          },
        },
        {
          fieldName: 'keyword',
          label: $t('content.review.record.table.search.keyword'),
          component: 'Input',
          componentProps: {
            placeholder: $t(
              'content.review.record.table.search.keyword_placeholder',
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
    tableActionColumn: { width: '170px', align: 'center' },
    permissions: {
      view: 'content:review:record:read',
    },
  };
}
