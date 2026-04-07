<template>
  <ElTimeline class="terminal-timeline" v-if="taskList.length">
    <ElTimelineItem
      v-for="(item, idx) in taskList"
      :key="idx"
      class="task-item"
      :class="'task-status-' + item.status"
      :type="getTaskStatus(item.status)['statusType']"
      center
      :timestamp="item.date"
      placement="top"
    >
      <ElCard>
        <div>
          <!-- 任务状态标签 -->
          <el-tag :type="getTaskStatus(item.status)['statusType']">{{
            getTaskStatus(item.status)["statusText"]
          }}</el-tag>
          <!-- 失败时阻止后续任务标签 -->
          <el-tag
            class="block-on-failure-tag"
            v-if="
              (item.status == taskStatus.Failed ||
                item.status == taskStatus.Unknown) &&
              item.blockOnFailure
            "
            type="warning"
          >
            {{ $t("tools.terminal.block_on_failure") }}
          </el-tag>
          <!-- 执行时请勿刷新浏览器标签 -->
          <el-tag
            class="block-on-failure-tag"
            v-if="
              item.status == taskStatus.Connecting ||
              item.status == taskStatus.Executing
            "
            type="danger"
          >
            {{ $t("tools.terminal.not_refresh_browser") }}
          </el-tag>
          <!-- 命令文本 -->
          <span class="command">{{ item.displayCommand || item.command }}</span>
          <!-- 任务操作按钮 -->
          <div class="task-opt">
            <!-- 重试按钮 -->
            <ElButton
              :title="$t('Retry')"
              v-if="
                item.status == taskStatus.Failed ||
                item.status == taskStatus.Unknown
              "
              size="small"
              v-blur
              type="warning"
              :icon="RefreshRight"
              circle
              @click="$emit('retry', idx)"
            />
            <!-- 删除按钮 -->
            <ElButton
              @click="$emit('delete', idx)"
              :title="$t('Delete')"
              size="small"
              v-blur
              type="danger"
              :icon="Delete"
              circle
            />
          </div>
        </div>
        <!-- 任务消息显示区域 -->
        <template v-if="item.status != taskStatus.Waiting">
          <!-- 消息展开/折叠切换 -->
          <div
            v-if="
              item.status != taskStatus.Connecting &&
              item.status != taskStatus.Executing
            "
            @click="$emit('toggle-message', idx)"
            class="toggle-message-display"
          >
            <span>{{ $t("tools.terminal.actions.command_run_log") }}</span>
            <Icon
              :icon="item.showMessage ? 'ep:arrow-up' : 'ep:arrow-down'"
              size="16"
              color="#909399"
            />
          </div>
          <!-- 消息内容显示 -->
          <div
            v-if="
              item.status == taskStatus.Connecting ||
              item.status == taskStatus.Executing ||
              (item.status > taskStatus.Executing && item.showMessage)
            "
            class="exec-message"
            :class="'exec-message-' + item.uuid"
          >
            <pre
              v-for="(msg, index) in item.message"
              :key="index"
              class="message-item"
              >{{ msg }}</pre
            >
          </div>
        </template>
      </ElCard>
    </ElTimelineItem>
  </ElTimeline>
  <!-- 空任务提示 -->
  <ElEmpty v-else :image-size="80" :description="$t('tools.terminal.empty')" />
</template>

<script setup lang="ts">
import { RefreshRight, Delete } from "@element-plus/icons-vue";
import { taskStatus } from "@/enums/index";
import { $t } from "@/locales";

defineOptions({ name: "TaskTimeline" });

const props = defineProps<{
  taskList: any[];
}>();

const emit = defineEmits<{
  retry: [idx: number];
  delete: [idx: number];
  "toggle-message": [idx: number];
}>();

/**
 * 获取任务状态文本和类型
 */
const getTaskStatus = (status: number) => {
  const statusMap: Record<number, { statusText: string; statusType: any }> = {
    [taskStatus.Waiting]: {
      statusText: $t("tools.terminal.status.waiting"),
      statusType: "info",
    },
    [taskStatus.Connecting]: {
      statusText: $t("tools.terminal.status.connecting"),
      statusType: "warning",
    },
    [taskStatus.Executing]: {
      statusText: $t("tools.terminal.status.executing"),
      statusType: "warning",
    },
    [taskStatus.Success]: {
      statusText: $t("tools.terminal.status.success"),
      statusType: "success",
    },
    [taskStatus.Failed]: {
      statusText: $t("tools.terminal.status.failed"),
      statusType: "danger",
    },
    [taskStatus.Unknown]: {
      statusText: $t("tools.terminal.status.unknown"),
      statusType: "danger",
    },
  };

  return (
    statusMap[status] || {
      statusText: $t("tools.terminal.status.unknown"),
      statusType: "danger",
    }
  );
};
</script>

<style scoped lang="scss">
.terminal-timeline {
  padding: 0 15px;
}

.command {
  font-size: var(--el-font-size-large);
  font-weight: bold;
  margin-left: 10px;
}

.exec-message {
  color: #e0e0e0;
  font-size: 12px;
  line-height: 16px;
  padding: 6px;
  background-color: #424251;
  margin-top: 10px;
  min-height: 30px;
  max-height: 200px;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c8c9cc;
    border-radius: 4px;
    box-shadow: none;
    -webkit-box-shadow: none;
  }
  &::-webkit-scrollbar-track {
    background: var(--ba-bg-color);
  }
  &:hover {
    &::-webkit-scrollbar-thumb:hover {
      background: #909399;
    }
  }
}

@supports not (selector(::-webkit-scrollbar)) {
  .exec-message {
    scrollbar-width: thin;
    scrollbar-color: #c8c9cc #eaeaea;
  }
}

.toggle-message-display {
  padding-top: 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.task-opt {
  display: none;
  float: right;
}

.task-item.task-status-0:hover,
.task-item.task-status-3:hover,
.task-item.task-status-4:hover,
.task-item.task-status-5:hover {
  .task-opt {
    display: inline;
  }
}

.block-on-failure-tag {
  margin-left: 10px;
}
</style>
