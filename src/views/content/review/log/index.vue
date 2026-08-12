<script setup lang="ts">
import type { ActionItem } from '#/components/crud/components/types';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { reviewLogService } from '#/api/content/review/log';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import { useCrudSchema } from './schemas';

async function handleClean() {
  try {
    const { value } = await ElMessageBox.prompt(
      $t('content.review.log.clean.confirm_text'),
      $t('content.review.log.clean.title'),
      {
        confirmButtonText: $t('content.review.log.clean.confirm_button'),
        cancelButtonText: $t('common.cancel'),
        inputPlaceholder: $t('content.review.log.clean.input_placeholder', {
          default: 90,
        }),
        inputValue: '90',
        inputPattern: /^\d+$/,
        inputErrorMessage: $t('content.review.log.clean.input_error'),
        type: 'warning',
        distinguishCancelAndClose: true,
        beforeClose(action, instance, done) {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = $t(
              'content.review.log.clean.cleaning',
            );
            done();
          } else {
            done();
          }
        },
      },
    );
    const days = Number(value);
    const res = await reviewLogService.clean(days);
    const count = (res as any)?.count ?? 0;
    ElMessage.success($t('content.review.log.clean.success', { count, days }));
    crudApi.refreshData();
  } catch {
    // 取消或关闭弹窗
  }
}

const schema = {
  ...useCrudSchema(),
  toolbarActions: [
    {
      label: $t('content.review.log.clean.title'),
      type: 'warning',
      sort: -2,
      icon: 'ant-design:clear-outlined',
      auth: 'content:review:log:clean',
      onClick: () => handleClean(),
    },
  ] as ActionItem[],
};

const [Crud, crudApi] = useCrud(schema);
</script>

<template>
  <Page auto-content-height>
    <Crud />
  </Page>
</template>
