<template>
  <div>
    <!-- 终端主对话框 -->
    <ElDialog
      v-model="terminal.state.show"
      :title="$t('tools.terminal.title')"
      class="terminal-dialog"
      draggable
    >
      <!-- 终端滚动区域 -->
      <ElScrollbar
        ref="terminalScrollbarRef"
        :max-height="400"
        class="terminal-scrollbar"
      >
        <!-- 任务时间线 -->
        <TaskTimeline
          :task-list="terminal.state.taskList"
          @retry="handleRetry"
          @delete="handleDelete"
          @toggle-message="handleToggleMessage"
        />
      </ElScrollbar>

      <!-- 命令按钮组 -->
      <CommandButtons
        :package-manager="terminal.state.packageManager"
        @add-task="handleAddTask"
        @clear-success="handleClearSuccess"
        @toggle-config="handleToggleConfig"
      />
    </ElDialog>

    <!-- 配置对话框 -->
    <ConfigDialog
      :visible="terminal.state.showConfig"
      :form-data="configForm"
      @close="handleToggleConfig(false)"
      @save="handleSaveConfig"
      @change-registry="handleChangeRegistry"
      @change-package-manager="handleChangePackageManager"
      @change-cleanup="handleChangeCleanup"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, useTemplateRef } from "vue";
import { ElMessage } from "element-plus";
import { useTerminalStore } from "@/store/modules/terminal";
import { $t } from "@/locales";
import { mittBus } from "@/utils";
import TaskTimeline from "./components/task-timeline.vue";
import CommandButtons from "./components/command-buttons.vue";
import ConfigDialog from "./components/config-dialog.vue";

defineOptions({ name: "terminal-command" });

// 终端状态管理
const terminal = useTerminalStore();
// 终端滚动条引用
const terminalScrollbarRef = useTemplateRef("terminalScrollbarRef");

// 配置表单数据
const configForm = reactive({
  npm_registry: terminal.state.npmRegistry,
  composer_registry: terminal.state.composerRegistry,
  package_manager: terminal.state.packageManager,
  automatic_cleanup_task: terminal.state.automaticCleanupTask,
});

/**
 * 处理重试任务
 */
const handleRetry = (idx: number) => {
  terminal.retryTask(idx);
};

/**
 * 处理删除任务
 */
const handleDelete = (idx: number) => {
  terminal.delTask(idx);
};

/**
 * 处理切换消息显示
 */
const handleToggleMessage = (idx: number) => {
  terminal.setTaskShowMessage(idx);
};

/**
 * 处理添加任务
 */
const handleAddTask = (command: string, pm: boolean, blockOnFailure = true) => {
  if (!terminal.state.show) {
    terminal.toggleDot(true);
  }

  if (pm) {
    terminal.addTaskPM(command, blockOnFailure);
  } else {
    terminal.addTask(command, blockOnFailure);
  }

  // 任务列表滚动条滚动到底部
  nextTick(() => {
    if (terminalScrollbarRef.value && terminalScrollbarRef.value.wrapRef) {
      terminalScrollbarRef.value.setScrollTop(
        terminalScrollbarRef.value.wrapRef.scrollHeight
      );
    }
  });
};

/**
 * 处理清空成功任务
 */
const handleClearSuccess = () => {
  terminal.clearSuccessTask();
};

/**
 * 处理切换配置对话框
 */
const handleToggleConfig = (val = !terminal.state.showConfig) => {
  terminal.toggle(!val);
  terminal.state.showConfig = val;

  // 同步配置表单数据
  if (val) {
    configForm.npm_registry = terminal.state.npmRegistry;
    configForm.composer_registry = terminal.state.composerRegistry;
    configForm.package_manager = terminal.state.packageManager;
    configForm.automatic_cleanup_task = terminal.state.automaticCleanupTask;
  }
};

/**
 * 处理更改源
 */
const handleChangeRegistry = (val: string, type: "npm" | "composer") => {
  terminal.changeRegistry(val, type);
};

/**
 * 处理更改包管理器
 */
const handleChangePackageManager = (val: string) => {
  terminal.changePackageManager(val);
};

/**
 * 处理更改自动清理设置
 */
const handleChangeCleanup = (val: string) => {
  terminal.changeAutomaticCleanupTask(val as "0" | "1");
};

/**
 * 处理保存配置
 */
const handleSaveConfig = async () => {
  // 检查是否有任务
  if (terminal.state.taskList.length > 0) {
    ElMessage({
      message: $t("tools.terminal.messages.has_tasks"),
      type: "warning",
      duration: 3000,
    });
    return;
  }

  try {
    // 保存配置到后端
    const success = await terminal.saveConfig();
    if (success) {
      // 显示成功提示
      ElMessage({
        message: $t("tools.terminal.messages.config_saved"),
        type: "success",
        duration: 3000,
      });
      // 关闭配置对话框
      terminal.state.showConfig = false;
      terminal.toggle(true);
    } else {
      throw new Error("保存失败");
    }
  } catch (error) {
    console.error("保存配置失败:", error);
    ElMessage({
      message: $t("tools.terminal.messages.config_save_failed"),
      type: "error",
      duration: 3000,
    });
  }
};

/**
 * 打开终端
 */
const openTerminal = (): void => {
  terminal.state.show = true;
};

/**
 * 关闭终端
 */
const closeTerminal = (): void => {
  terminal.state.show = false;
};

// 组件挂载时初始化
onMounted(() => {
  terminal.init();
  // 注册打开终端事件监听
  mittBus.on("openTerminalCommand", openTerminal);
});

// 组件卸载时清理
onUnmounted(() => {
  // 移除打开终端事件监听
  mittBus.off("openTerminalCommand", closeTerminal);
});
</script>

<style scoped lang="scss">
// 终端对话框样式
:deep(.terminal-dialog) {
  --el-dialog-padding-primary: 15px 15px 0 15px;
  .el-dialog__body {
    margin-top: 15px;
  }
}

// 终端警告提示样式
.terminal-warning-alert {
  margin: 0 0 20px 0;
}
</style>
