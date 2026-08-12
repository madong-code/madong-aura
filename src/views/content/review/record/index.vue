<script setup lang="ts">
import type { ReviewRow } from '#/api/content/review/record/types';
import type { CrudSchema } from '#/components/crud/components/types';

import { ref } from 'vue';

import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import RecordDetail from './components/record-detail.vue';
import { useCrudSchema } from './schemas';

const recordDetailRef = ref<InstanceType<typeof RecordDetail>>();

const schema: CrudSchema = {
  ...useCrudSchema(),
  tableActions: [
    {
      label: $t('content.review.record.actions.detail'),
      type: 'primary',
      link: true,
      auth: 'content:review:record:read',
      onClick: (_e: MouseEvent, _row: ReviewRow) => {
        recordDetailRef.value?.show({ data: _row });
      },
    },
  ],
};

const [Crud] = useCrud(schema);
</script>

<template>
  <Page auto-content-height>
    <Crud />
    <RecordDetail ref="recordDetailRef" />
  </Page>
</template>
