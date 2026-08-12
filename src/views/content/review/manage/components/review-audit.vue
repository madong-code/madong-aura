<script setup lang="ts">
import type { ReviewRow } from '#/api/content/review/manage/types';

import { computed, ref, watch } from 'vue';

import {
  ElAlert,
  ElDescriptions,
  ElDescriptionsItem,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElRadioButton,
  ElRadioGroup,
  ElTag,
} from 'element-plus';

import { reviewManageService } from '#/api/content/review/manage';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';
import { formatDate } from '#/utils';

import { REVIEW_STATUS_OPTIONS } from '../schemas';

const emit = defineEmits<{ (e: 'refresh'): void }>();

const loading = ref(false);
const currentRow = ref<null | ReviewRow>(null);
const action = ref<'approve' | 'reject'>('approve');
const reason = ref('');

const REASON_MAX_LENGTH = 200;

const statusLabel = computed(() => {
  if (!currentRow.value) return '-';
  return (
    REVIEW_STATUS_OPTIONS.find(
      (item) => item.value === currentRow.value?.status,
    )?.label ?? '-'
  );
});

const statusColor = computed(() => {
  if (!currentRow.value) return 'info';
  return (REVIEW_STATUS_OPTIONS.find(
    (item) => item.value === currentRow.value?.status,
  )?.color ?? 'info') as 'danger' | 'info' | 'primary' | 'success' | 'warning';
});

const typeText = computed(() => {
  if (!currentRow.value) return '-';
  const row = currentRow.value;
  return row.display_name ?? row.type_text ?? row.reviewable_type ?? '-';
});

const isReject = computed(() => action.value === 'reject');
const reasonLabel = computed(() =>
  isReject.value
    ? `* ${$t('content.review.manage.audit.reason')}`
    : $t('content.review.manage.audit.reason'),
);
const reasonPlaceholder = computed(() =>
  isReject.value
    ? $t('content.review.manage.audit.reject_reason_placeholder', {
        max: REASON_MAX_LENGTH,
      })
    : $t('content.review.manage.audit.approve_reason_placeholder', {
        max: REASON_MAX_LENGTH,
      }),
);

const [Dialog, dialogApi] = useDialog({
  title: $t('content.review.manage.actions.review'),
  width: '600px',
  dialogType: 'dialog',
  // 通过 unref 转为 boolean（h() 不会自动解包 ref）
  onConfirm: handleConfirm,
});

function show(opts: { data: ReviewRow }) {
  currentRow.value = opts.data;
  action.value = 'approve';
  reason.value = '';
  dialogApi.open();
}

watch(action, (val) => {
  if (val === 'approve') {
    reason.value = '';
  }
});

async function handleConfirm() {
  if (currentRow.value === null) return;
  const trimmed = reason.value.trim();
  if (action.value === 'reject' && !trimmed) {
    ElMessage.warning($t('content.review.manage.message.reject_reason'));
    return;
  }
  if (trimmed.length > REASON_MAX_LENGTH) {
    ElMessage.warning(
      $t('content.review.manage.audit.reason_too_long', {
        max: REASON_MAX_LENGTH,
      }),
    );
    return;
  }
  loading.value = true;
  try {
    if (action.value === 'approve') {
      await reviewManageService.approve(currentRow.value.id, trimmed, true);
      ElMessage.success($t('content.review.manage.message.approve_success'));
    } else {
      await reviewManageService.reject(currentRow.value.id, trimmed, true);
      ElMessage.success($t('content.review.manage.message.reject_success'));
    }
    dialogApi.close();
    emit('refresh');
  } catch (error: any) {
    ElMessage.error(
      error?.message ?? $t('content.review.manage.message.operation_failed'),
    );
  } finally {
    loading.value = false;
  }
}

defineExpose({ show });
</script>

<template>
  <Dialog>
    <div v-if="currentRow" class="review-audit">
      <!-- 业务信息卡片 -->
      <section class="review-audit__info">
        <header class="review-audit__info-header">
          <h3 class="review-audit__title">
            {{ currentRow.title ?? '-' }}
          </h3>
          <ElTag :type="statusColor" effect="light" round size="small">
            {{ statusLabel }}
          </ElTag>
        </header>

        <ElDescriptions
          :column="2"
          size="small"
          border
          class="review-audit__desc"
        >
          <ElDescriptionsItem
            :label="$t('content.review.manage.table.columns.type')"
          >
            {{ typeText }}
          </ElDescriptionsItem>
          <ElDescriptionsItem
            :label="$t('content.review.manage.table.columns.applicant')"
          >
            {{ currentRow.applicant ?? '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem
            v-if="currentRow.reviewable_id !== undefined"
            :label="$t('content.review.manage.detail.reviewable_id')"
          >
            #{{ currentRow.reviewable_id }}
          </ElDescriptionsItem>
          <ElDescriptionsItem
            :label="$t('content.review.manage.table.columns.created_at')"
          >
            {{
              currentRow.created_at ? formatDate(currentRow.created_at) : '-'
            }}
          </ElDescriptionsItem>
          <ElDescriptionsItem
            v-if="currentRow.content"
            :label="$t('content.review.manage.table.columns.summary')"
            :span="2"
          >
            <div class="review-audit__content">{{ currentRow.content }}</div>
          </ElDescriptionsItem>
        </ElDescriptions>
      </section>

      <!-- 审核操作表单 -->
      <ElForm
        label-width="84px"
        label-position="right"
        class="review-audit__form"
      >
        <ElFormItem :label="$t('content.review.manage.audit.action')">
          <ElRadioGroup v-model="action">
            <ElRadioButton value="approve">
              {{ $t('content.review.manage.actions.approve') }}
            </ElRadioButton>
            <ElRadioButton value="reject">
              {{ $t('content.review.manage.actions.reject') }}
            </ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem :label="reasonLabel">
          <ElInput
            v-model="reason"
            type="textarea"
            :rows="4"
            :maxlength="REASON_MAX_LENGTH"
            :placeholder="reasonPlaceholder"
            show-word-limit
            resize="none"
          />
        </ElFormItem>

        <ElAlert
          v-if="isReject"
          type="warning"
          :closable="false"
          show-icon
          class="review-audit__tip"
        >
          {{ $t('content.review.manage.audit.reject_tip') }}
        </ElAlert>
      </ElForm>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
.review-audit {
  padding: 4px 4px 0;
}

.review-audit__info {
  padding: 16px;
  margin-bottom: 20px;
  background: linear-gradient(
    135deg,
    rgb(64 158 255 / 4%) 0%,
    rgb(64 158 255 / 8%) 100%
  );
  border: 1px solid rgb(64 158 255 / 12%);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgb(64 158 255 / 24%);
    box-shadow: 0 2px 8px rgb(64 158 255 / 8%);
  }
}

.review-audit__info-header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.review-audit__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.review-audit__desc {
  overflow: hidden;
  border-radius: 6px;
}

.review-audit__content {
  line-height: 1.6;
  color: var(--el-text-color-regular);
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.review-audit__form {
  padding: 0 4px;
}

.review-audit__tip {
  margin-top: -4px;
  border-radius: 6px;
}
</style>
