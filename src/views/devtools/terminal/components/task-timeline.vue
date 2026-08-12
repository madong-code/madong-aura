<script setup lang="ts">
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';
import { ChevronDown, ChevronUp, RefreshCw, Trash2 } from 'lucide-vue-next';

import { TerminalTaskStatus } from '#/enums';
import { $t } from '#/locales';

defineOptions({ name: 'TerminalTaskTimeline' });

defineProps<{
  taskList: any[];
}>();

defineEmits<{
  delete: [idx: number];
  retry: [idx: number];
  toggleMessage: [idx: number];
}>();

const taskStatus = TerminalTaskStatus;

function getTaskStatus(status: number) {
  const map: Record<number, { statusText: string; statusType: any }> = {
    [TerminalTaskStatus.Waiting]: {
      statusText: $t('devtools.terminal.status.waiting'),
      statusType: 'info',
    },
    [TerminalTaskStatus.Connecting]: {
      statusText: $t('devtools.terminal.status.connecting'),
      statusType: 'warning',
    },
    [TerminalTaskStatus.Executing]: {
      statusText: $t('devtools.terminal.status.executing'),
      statusType: 'warning',
    },
    [TerminalTaskStatus.Success]: {
      statusText: $t('devtools.terminal.status.success'),
      statusType: 'success',
    },
    [TerminalTaskStatus.Failed]: {
      statusText: $t('devtools.terminal.status.failed'),
      statusType: 'danger',
    },
    [TerminalTaskStatus.Unknown]: {
      statusText: $t('devtools.terminal.status.unknown'),
      statusType: 'danger',
    },
  };
  return (
    map[status] || {
      statusText: $t('devtools.terminal.status.unknown'),
      statusType: 'danger',
    }
  );
}
</script>

<template>
  <ElTimeline class="terminal-timeline" v-if="taskList.length > 0">
    <ElTimelineItem
      v-for="(item, idx) in taskList"
      :key="idx"
      class="task-item"
      :class="`task-status-${item.status}`"
      :type="getTaskStatus(item.status).statusType"
      center
      :timestamp="item.date"
      placement="top"
    >
      <ElCard>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <ElTag :type="getTaskStatus(item.status).statusType">
              {{ getTaskStatus(item.status).statusText }}
            </ElTag>
            <ElTag
              v-if="
                (item.status === taskStatus.Failed ||
                  item.status === taskStatus.Unknown) &&
                item.blockOnFailure
              "
              type="warning"
            >
              {{ $t('devtools.terminal.block_on_failure') }}
            </ElTag>
            <ElTag
              v-if="
                item.status === taskStatus.Connecting ||
                item.status === taskStatus.Executing
              "
              type="danger"
            >
              {{ $t('devtools.terminal.not_refresh_browser') }}
            </ElTag>
            <span class="font-bold">{{
              item.displayCommand || item.command
            }}</span>
            <div class="task-opt">
              <ElButton
                v-if="
                  item.status === taskStatus.Failed ||
                  item.status === taskStatus.Unknown
                "
                circle
                size="small"
                type="warning"
                @click="$emit('retry', idx)"
              >
                <template #icon>
                  <RefreshCw class="size-3.5" />
                </template>
              </ElButton>
              <ElButton
                circle
                size="small"
                type="danger"
                @click="$emit('delete', idx)"
              >
                <template #icon>
                  <Trash2 class="size-3.5" />
                </template>
              </ElButton>
            </div>
          </div>

          <template v-if="item.status !== taskStatus.Waiting">
            <div
              v-if="
                item.status !== taskStatus.Connecting &&
                item.status !== taskStatus.Executing
              "
              class="mt-2 flex cursor-pointer select-none items-center justify-center gap-1 text-xs text-gray-500"
              @click="$emit('toggleMessage', idx)"
            >
              <span>{{ $t('devtools.terminal.actions.command_run_log') }}</span>
              <component
                :is="item.showMessage ? ChevronUp : ChevronDown"
                class="size-3.5"
              />
            </div>
            <div
              v-if="
                item.status === taskStatus.Connecting ||
                item.status === taskStatus.Executing ||
                (item.status > taskStatus.Executing && item.showMessage)
              "
              :class="`exec-message exec-message-${item.uuid}`"
            >
              <pre
                v-for="(msg, index) in item.message"
                :key="index"
                class="message-item"
                >{{ msg }}</pre
              >
            </div>
          </template>
        </div>
      </ElCard>
    </ElTimelineItem>
  </ElTimeline>
  <ElEmpty
    v-else
    :image-size="80"
    :description="$t('devtools.terminal.empty')"
  />
</template>

<style scoped>
.terminal-timeline {
  padding: 0 15px;
}

.task-opt {
  display: none;
  margin-left: auto;
}

.task-item.task-status-0:hover,
.task-item.task-status-3:hover,
.task-item.task-status-4:hover,
.task-item.task-status-5:hover {
  .task-opt {
    display: inline-flex;
    gap: 4px;
  }
}

.exec-message {
  max-height: 300px;
  padding: 6px;
  margin-top: 10px;
  overflow: auto;
  font-family: Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 16px;
  color: #e0e0e0;
  background-color: #1e1e2e;
  border-radius: 4px;
}

.message-item {
  margin: 0;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
