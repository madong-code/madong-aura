<script setup lang="ts">
import type {
  ReviewDetail,
  ReviewRow,
} from '#/api/content/review/record/types';

import { ref } from 'vue';

import {
  ElAlert,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElTabPane,
  ElTabs,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';

import { reviewRecordService } from '#/api/content/review/record';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

import { REVIEW_STATUS_OPTIONS } from '../schemas';

const loading = ref(false);
const detail = ref<null | ReviewDetail>(null);

const statusColorMap: Record<number, string> = {};
for (const item of REVIEW_STATUS_OPTIONS) {
  statusColorMap[item.value] = item.color;
}

function statusColor(status: number): string {
  return statusColorMap[status] ?? 'default';
}

function formatDateTime(value: any): string {
  if (value === null || value === undefined || value === '') return '-';
  let ts = 0;
  if (typeof value === 'number') {
    ts = value;
  } else if (typeof value === 'object') {
    // PHP Carbon toArray() 格式：优先 timestamp、formatted、date、year
    if (value.timestamp !== null && value.timestamp !== undefined)
      ts = value.timestamp;
    else if (value.formatted) return value.formatted;
    else if (value.date) {
      const parsed = new Date(value.date);
      if (!Number.isNaN(parsed.getTime())) return formatDateStr(parsed);
      return '-';
    } else if (value.year !== null && value.year !== undefined) {
      // {year, month, day, hour, minute, second}
      const d = new Date(
        value.year,
        (value.month || 1) - 1,
        value.day || 1,
        value.hour || 0,
        value.minute || 0,
        value.second || 0,
      );
      return Number.isNaN(d.getTime()) ? '-' : formatDateStr(d);
    }
  } else if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime()) && parsed.getFullYear() > 1970)
      return formatDateStr(parsed);
    return value;
  }
  const d = new Date(ts * 1000);
  return Number.isNaN(d.getTime()) ? String(value) : formatDateStr(d);
}
function formatDateStr(d: Date): string {
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function loadDetail(id: number) {
  loading.value = true;
  try {
    detail.value = await reviewRecordService.detail(id);
  } finally {
    loading.value = false;
  }
}

const [Dialog, dialogApi] = useDialog({
  title: $t('content.review.record.detail.title'),
  width: '720px',
  dialogType: 'drawer',
  footer: false,
  destroyOnClose: true,
});

function show(opts: { data: ReviewRow }) {
  dialogApi.open();
  loadDetail(opts.data.id);
}

defineExpose({ show });

const activeTab = ref('info');
</script>

<template>
  <Dialog>
    <div v-loading="loading" class="p-2">
      <ElAlert
        v-if="detail?.is_archived"
        :title="$t('content.review.record.detail.archived_tip')"
        type="info"
        :closable="false"
        class="mb-3"
      />

      <ElTabs v-model="activeTab">
        <ElTabPane
          :label="$t('content.review.record.detail.tabs.info')"
          name="info"
        >
          <ElDescriptions :column="2" border size="small">
            <ElDescriptionsItem
              :label="$t('content.review.record.table.columns.id')"
            >
              {{ detail?.review_info?.id }}
            </ElDescriptionsItem>
            <ElDescriptionsItem
              :label="$t('content.review.record.table.columns.type')"
            >
              {{ detail?.review_info?.type_text }}
            </ElDescriptionsItem>
            <ElDescriptionsItem
              :label="$t('content.review.record.table.columns.applicant')"
            >
              {{ detail?.review_info?.applicant }}
            </ElDescriptionsItem>
            <ElDescriptionsItem
              :label="$t('content.review.record.detail.reviewable_id')"
            >
              {{ detail?.review_info?.reviewable_id }}
            </ElDescriptionsItem>
            <ElDescriptionsItem
              :label="$t('content.review.record.table.columns.created_at')"
            >
              {{ formatDateTime(detail?.review_info?.created_at) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem
              :label="$t('content.review.record.detail.created_by')"
            >
              {{ detail?.review_info?.created_by }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElTabPane>

        <ElTabPane
          :label="$t('content.review.record.detail.tabs.form')"
          name="form"
        >
          <ElEmpty
            v-if="!detail?.form || Object.keys(detail.form).length === 0"
            :description="$t('content.review.record.detail.no_form')"
          />
          <ElDescriptions v-else :column="1" border size="small">
            <ElDescriptionsItem
              v-for="(value, key) in detail.form"
              :key="key"
              :label="String(key)"
            >
              {{ value }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElTabPane>

        <ElTabPane
          :label="$t('content.review.record.detail.tabs.status')"
          name="status"
        >
          <ElDescriptions :column="2" border size="small">
            <ElDescriptionsItem
              :label="$t('content.review.record.table.columns.status')"
            >
              <ElTag :type="statusColor(detail?.status?.status ?? 0) as any">
                {{ detail?.status?.status_text }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem
              :label="$t('content.review.record.detail.flow_type')"
            >
              {{ detail?.status?.flow_type }}
            </ElDescriptionsItem>
            <ElDescriptionsItem
              :label="$t('content.review.record.table.columns.reviewer')"
            >
              {{ detail?.status?.reviewer_id }}
            </ElDescriptionsItem>
            <ElDescriptionsItem
              :label="$t('content.review.record.table.columns.reviewed_at')"
            >
              {{ formatDateTime(detail?.status?.reviewed_at) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem
              v-if="detail?.status?.reason"
              :label="$t('content.review.record.detail.reason')"
            >
              {{ detail?.status?.reason }}
            </ElDescriptionsItem>
            <ElDescriptionsItem
              v-if="detail?.status?.cancel_reason"
              :label="$t('content.review.record.detail.cancel_reason')"
            >
              {{ detail?.status?.cancel_reason }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElTabPane>

        <ElTabPane
          :label="$t('content.review.record.detail.tabs.events')"
          name="events"
        >
          <ElEmpty
            v-if="!detail?.events || detail.events.length === 0"
            :description="$t('content.review.record.detail.no_events')"
          />
          <ElTimeline v-else>
            <ElTimelineItem
              v-for="event in detail.events"
              :key="event.id"
              :timestamp="formatDateTime(event.created_at)"
              placement="top"
            >
              <div class="flex items-center gap-2">
                <ElTag size="small">{{ event.action_text }}</ElTag>
                <span class="text-muted-foreground text-xs"
                  >#{{ event.operator_id }}</span
                >
              </div>
              <div v-if="event.reason" class="mt-1 text-sm">
                {{ event.reason }}
              </div>
            </ElTimelineItem>
          </ElTimeline>
        </ElTabPane>
      </ElTabs>
    </div>
  </Dialog>
</template>
