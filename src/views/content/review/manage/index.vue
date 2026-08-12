<script setup lang="ts">
import type { ReviewRow } from '#/api/content/review/manage/types';
import type { ActionItem } from '#/components/crud/components/types';

import { ref } from 'vue';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { reviewManageService } from '#/api/content/review/manage';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import ReviewAudit from './components/review-audit.vue';
import { useCrudSchema } from './schemas';

const reviewAuditRef = ref<InstanceType<typeof ReviewAudit>>();

/** 以弹窗输入原因（拒绝使用） */
async function promptReason(
  title: string,
  inputPlaceholder = '',
  required = true,
): Promise<null | string> {
  try {
    const { value } = await ElMessageBox.prompt(
      title,
      $t('content.review.manage.title'),
      {
        confirmButtonText: $t('common.confirm'),
        cancelButtonText: $t('common.cancel'),
        inputType: 'textarea',
        inputPlaceholder,
        inputValidator: (val) => {
          if (required && (!val || !val.trim())) {
            return $t('content.review.manage.message.reject_required');
          }
          return true;
        },
      },
    );
    return value ?? '';
  } catch {
    return null;
  }
}

async function handleBatchApprove() {
  const rows = crudApi.getRowSelection();
  if (!rows || rows.length === 0) {
    ElMessage.warning($t('common.selectAtLeastOne'));
    return;
  }
  const ids = rows.map((item: ReviewRow) => item.id);
  try {
    await ElMessageBox.confirm(
      $t('content.review.manage.message.batch_approve_confirm', {
        count: ids.length,
      }),
      $t('content.review.manage.title'),
      {
        confirmButtonText: $t('common.confirm'),
        cancelButtonText: $t('common.cancel'),
        type: 'warning',
      },
    );
  } catch {
    return;
  }
  try {
    const res = await reviewManageService.batchApprove(ids, true);
    const count = (res as { count?: number })?.count ?? ids.length;
    if (count < ids.length) {
      ElMessage.warning(
        $t('content.review.manage.message.batch_approve_partial', {
          done: count,
          total: ids.length,
        }),
      );
    } else {
      ElMessage.success($t('content.review.manage.message.approve_success'));
    }
    crudApi.refreshData();
  } catch (error: any) {
    ElMessage.error(
      error?.message ?? $t('content.review.manage.message.operation_failed'),
    );
  }
}

async function handleBatchReject() {
  const rows = crudApi.getRowSelection();
  if (!rows || rows.length === 0) {
    ElMessage.warning($t('common.selectAtLeastOne'));
    return;
  }
  const ids = rows.map((item: ReviewRow) => item.id);
  const reason = await promptReason(
    $t('content.review.manage.message.batch_reject_reason'),
    $t('content.review.manage.message.batch_reject_placeholder'),
  );
  if (reason === null) return;
  try {
    const res = await reviewManageService.batchReject(ids, reason, true);
    const count = (res as { count?: number })?.count ?? ids.length;
    if (count < ids.length) {
      ElMessage.warning(
        $t('content.review.manage.message.batch_reject_partial', {
          done: count,
          total: ids.length,
        }),
      );
    } else {
      ElMessage.success($t('content.review.manage.message.reject_success'));
    }
    crudApi.refreshData();
  } catch (error: any) {
    ElMessage.error(
      error?.message ?? $t('content.review.manage.message.operation_failed'),
    );
  }
}

const schema = {
  ...useCrudSchema(),
  tableActions: [
    {
      label: $t('content.review.manage.actions.review'),
      type: 'primary',
      link: true,
      auth: 'content:review:manage:approve',
      ifShow: (_action: ActionItem, record: any) =>
        [0, 4].includes((record as ReviewRow).status),
      onClick: (_e: any, row: any) => {
        reviewAuditRef.value?.show({ data: row as ReviewRow });
      },
    },
  ] as ActionItem[],
  toolbarActions: [
    {
      label: $t('content.review.manage.actions.batch_approve'),
      type: 'primary',
      auth: 'content:review:manage:approve',
      onClick: () => handleBatchApprove(),
    },
    {
      label: $t('content.review.manage.actions.batch_reject'),
      type: 'danger',
      auth: 'content:review:manage:reject',
      onClick: () => handleBatchReject(),
    },
  ] as ActionItem[],
};

const [Crud, crudApi] = useCrud(schema);
</script>

<template>
  <Page auto-content-height>
    <Crud />
    <ReviewAudit ref="reviewAuditRef" @refresh="crudApi.refreshData()" />
  </Page>
</template>
