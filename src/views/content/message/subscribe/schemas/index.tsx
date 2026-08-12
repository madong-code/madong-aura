import type { CrudSchema } from '#/components/crud/components/types';

import { SubscribeService } from '#/api/content/message/subscribe';
import { $t } from '#/locales';

export function useCrudSchema(): CrudSchema {
  return {
    crudApi: {
      list: SubscribeService.getMine,
    },
    rowKey: 'module_key',
    hasAdd: false,
    hasEdit: false,
    hasRemove: false,
    hasView: false,
    hasBatchRemove: false,
    checkable: false,
    border: 'none' as any,
    stripe: true,
    pagerConfig: { enabled: true, pageSize: 15 },
    searchForm: {
      enabled: true,
      submitOnChange: true,
      schema: [
        {
          fieldName: 'keyword',
          label: $t('content.message.subscribe.search.keyword'),
          component: 'Input',
          componentProps: {
            placeholder: $t('content.message.subscribe.search.placeholder'),
          },
        },
      ],
    },
    toolbar: {
      refresh: true,
      custom: true,
      zoom: true,
      export: false,
    },
    columns: [
      // { type: 'seq', width: 60, title: '#' },
      {
        field: 'module_name',
        title: $t('content.message.subscribe.columns.title'),
        minWidth: 120,
        width: 200,
        align: 'left',
      },
      {
        field: 'content_template',
        title: $t('content.message.subscribe.columns.content'),
        showOverflow: 'tooltip',
        minWidth: 300,
        align: 'left',
      },
      {
        field: 'category_name',
        title: $t('content.message.subscribe.columns.type'),
        width: 140,
      },
      {
        field: 'is_subscribed',
        title: $t('content.message.subscribe.columns.notification'),
        align: 'center',
        vxeColumn: { slots: { default: 'isSubscribedToggle' } },
      },
    ],
  };
}
