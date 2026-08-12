<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';

import { ElMessage } from 'element-plus';
import { TerminalSquare } from 'lucide-vue-next';

import { useVbenModal } from '#/core/ui/common';
import { $t } from '#/locales';
import { useTerminalStore } from '#/store';

import CommandButtons from './components/command-buttons.vue';
import ConfigDialog from './components/config-dialog.vue';
import TaskTimeline from './components/task-timeline.vue';

const terminal = useTerminalStore();

// 使用 Vben Modal
const [Modal, modalApi] = useVbenModal({
  title: '命令终端',
  class: 'w-[850px]',
  draggable: true,
  showConfirmButton: false,
  showCancelButton: false,
  footer: true,
  closable: true,
  destroyOnClose: false,
  closeOnClickModal: false,
  // 隐藏横向滚动，内容区作为全局垂直滚动容器
  contentClass: 'overflow-x-hidden',
  // 弹窗关闭时同步回 store
  onOpenChange(isOpen) {
    if (!isOpen && terminal.state.show) {
      terminal.toggle(false);
    }
  },
});

// 同步 store show 状态到 modal
watch(
  () => terminal.state.show,
  (val) => {
    if (val) {
      modalApi.open();
    } else {
      modalApi.close();
    }
  },
);

const configForm = reactive({
  npm_registry: terminal.state.npmRegistry,
  composer_registry: terminal.state.composerRegistry,
  package_manager: terminal.state.packageManager,
  automatic_cleanup_task: terminal.state.automaticCleanupTask,
});

function handleRetry(idx: number) {
  terminal.retryTask(idx);
}
function handleDelete(idx: number) {
  terminal.delTask(idx);
}
function handleToggleMessage(idx: number) {
  terminal.setTaskShowMessage(idx);
}

function handleAddTask(command: string, pm: boolean, blockOnFailure = true) {
  if (!terminal.state.show) {
    terminal.toggle(true);
  }
  if (pm) {
    terminal.addTaskPM(command, blockOnFailure);
  } else {
    terminal.addTask(command, blockOnFailure);
  }
}

function handleClearSuccess() {
  terminal.clearSuccessTask();
}

function handleToggleConfig(val = !terminal.state.showConfig) {
  terminal.toggleConfigDialog(val);
  if (val) {
    configForm.npm_registry = terminal.state.npmRegistry;
    configForm.composer_registry = terminal.state.composerRegistry;
    configForm.package_manager = terminal.state.packageManager;
    configForm.automatic_cleanup_task = terminal.state.automaticCleanupTask;
  }
}

async function handleSaveConfig() {
  // 检查是否有执行中的任务
  if (terminal.state.taskList.length > 0) {
    ElMessage({
      message: '请先完成所有任务后再保存配置',
      type: 'warning',
      duration: 3000,
    });
    return;
  }

  try {
    const success = await terminal.saveConfig();
    if (success) {
      ElMessage({
        message: '配置保存成功',
        type: 'success',
        duration: 3000,
      });
      terminal.state.showConfig = false;
      terminal.toggle(true);
    } else {
      throw new Error('保存失败');
    }
  } catch (error) {
    console.error('保存配置失败:', error);
    ElMessage({
      message: '配置保存失败',
      type: 'error',
      duration: 3000,
    });
  }
}

function handleChangeRegistry(val: string, type: 'composer' | 'npm') {
  terminal.changeRegistry(val, type);
}

function handleChangePackageManager(val: string) {
  terminal.changePackageManager(val);
}

function handleChangeCleanup(val: string) {
  terminal.changeAutomaticCleanupTask(val as '0' | '1');
}

onMounted(() => {
  terminal.init();
});
</script>

<template>
  <div>
    <!-- 终端主对话框 -->
    <Modal>
      <template #title>
        <div class="flex items-center gap-2">
          <TerminalSquare class="size-[18px]" />
          <span class="font-bold text-base">{{
            $t('devtools.terminal.title')
          }}</span>
        </div>
      </template>
      <div>
        <TaskTimeline
          :task-list="terminal.state.taskList"
          @retry="handleRetry"
          @delete="handleDelete"
          @toggle-message="handleToggleMessage"
        />
      </div>

      <!-- 操作按钮固定到弹窗底部，滚动时始终可见 -->
      <template #append-footer>
        <CommandButtons
          :package-manager="terminal.state.packageManager"
          @add-task="handleAddTask"
          @clear-success="handleClearSuccess"
          @toggle-config="handleToggleConfig"
        />
      </template>
    </Modal>

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

<style scoped>
/* Modal 默认的 overflow-y-auto 提供全局滚动 */
</style>
