<script setup lang="ts">
/** 三步安装对话框：环境检查 → 安装进度 → 安装完成 — 100% 移植自 madong-vue module-install-dialog */
import { nextTick, onUnmounted, ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElMessage,
  ElProgress,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { requestClient, sse } from '#/api/request';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

defineOptions({ name: 'ModuleInstallDialog' });

const props = defineProps<{ plugin: any }>();

const emit = defineEmits<{ close: []; refresh: [] }>();

const [Dialog, dialogApi] = useDialog({
  title: $t('app.plugin.market.standalone.install.title'),
  width: '800px',
  fullscreen: false,
  footer: false,
  draggable: true,
  closeOnClickModal: false,
  destroyOnClose: true,
});

const loading = ref(false);
const currentStep = ref(1);
const environmentChecks = ref<any[]>([]);
const installationProgress = ref(0);
const installationStatus = ref<string>('');
const installationLogs = ref<string[]>([]);
const installationResult = ref<'error' | 'success'>('success');
const logsContainer = ref<HTMLElement>();
let sseConn: null | { close: () => void } = null;

const openDialog = async () => {
  if (!props.plugin?.name && !props.plugin?.code) {
    ElMessage.error('模块信息不完整，无法进行环境检测');
    return;
  }
  dialogApi.open();
  currentStep.value = 1;
  installationProgress.value = 0;
  installationStatus.value = '';
  installationLogs.value = [];
  installationResult.value = 'success';
  await loadEnvironmentChecks();
};

const loadEnvironmentChecks = async () => {
  loading.value = true;
  try {
    const response: any = await requestClient.get('/plugin/check-environment', {
      params: {
        code: props.plugin.code,
        name: props.plugin.name,
        timestamp: Date.now(),
      },
    });
    environmentChecks.value = response?.paths
      ? response.paths.map((item: any) => ({
          path: item.path,
          requirement: item.requirement === 'readable' ? '可读' : '可写',
          status: item.status,
        }))
      : [];
  } catch {
    environmentChecks.value = [];
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  sseConn?.close();
  sseConn = null;
  dialogApi.close();
  emit('close');
};

const scrollToBottom = () => {
  nextTick(() => {
    if (logsContainer.value)
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
  });
};

const startInstallation = async () => {
  currentStep.value = 2;
  installationProgress.value = 0;
  installationLogs.value = ['开始安装...'];
  await startSseInstallation();
};

const startSseInstallation = async () => {
  const installMode = props.plugin.is_local === 1 ? 'local' : 'remote';
  const url = `/plugin/${props.plugin.code}/install?source=${installMode}`;
  sseConn = sse(url, {
    open: () => {
      // SSE连接已打开
    },
    progress: (payload: any) => {
      // Sse::make() 包裹数据，实际内容在 payload.data 中
      const eventData = payload?.data || payload;
      if (eventData.progress !== undefined)
        installationProgress.value = eventData.progress;
      if (eventData.message) {
        installationLogs.value.push(eventData.message);
        scrollToBottom();
      }
    },
    completed: (payload: any) => {
      const eventData = payload?.data || payload;
      if (eventData.message) {
        installationLogs.value.push(eventData.message);
        scrollToBottom();
      }
      installationStatus.value = 'success';
      currentStep.value = 3;
      installationResult.value = 'success';
      sseConn?.close();
      scrollToBottom();
    },
    warning: (payload: any) => {
      // warning 处理器：插件已安装等提示信息
      const eventData = payload?.data || payload;
      if (eventData.message) {
        installationLogs.value.push(`警告: ${eventData.message}`);
        scrollToBottom();
      }
      installationStatus.value = 'warning';
      currentStep.value = 3;
      installationResult.value = 'success';
      sseConn?.close();
      scrollToBottom();
    },
    error: (payload: any) => {
      // error 处理器仅在服务器主动发送 event: error 时触发（连接关闭不会触发此处理器）
      const eventData = payload?.data || payload;
      if (eventData.message) {
        installationLogs.value.push(`错误: ${eventData.message}`);
        installationStatus.value = 'exception';
        currentStep.value = 3;
        installationResult.value = 'error';
        sseConn?.close();
        scrollToBottom();
      }
    },
    onError: () => {
      // onError 仅在连接意外断开时触发（没有收到服务器 error 事件）
      // 如果已完成就不覆盖成功状态
      if (currentStep.value < 3) {
        installationLogs.value.push('SSE连接错误');
        installationStatus.value = 'exception';
        currentStep.value = 3;
        installationResult.value = 'error';
        sseConn?.close();
        scrollToBottom();
      }
    },
    message: (payload: any) => {
      // 兜底处理器：捕获没有命名事件的 SSE 消息
      const eventData = payload?.data || payload;
      if (eventData.message) {
        installationLogs.value.push(eventData.message);
        scrollToBottom();
      }
    },
  });
};

const handleRefresh = () => {
  emit('refresh');
  handleClose();
};

const handleRetry = () => {
  currentStep.value = 2;
  installationProgress.value = 0;
  installationLogs.value = ['开始重新安装...'];
  installationStatus.value = '';
  installationResult.value = 'success';
  startSseInstallation();
};

onUnmounted(() => {
  sseConn?.close();
});

defineExpose({ openDialog });
</script>

<template>
  <Dialog>
    <ElCard class="box-card !border-none" shadow="never">
      <div v-loading="loading">
        <!-- 步骤指示器 -->
        <div class="steps-indicator mb-6">
          <div
            class="step"
            :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
          >
            <div class="step-number">{{ currentStep > 1 ? '✓' : '1' }}</div>
            <div class="step-label">
              {{ $t('app.plugin.market.standalone.install.step1') }}
            </div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
          <div
            class="step"
            :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
          >
            <div class="step-number">{{ currentStep > 2 ? '✓' : '2' }}</div>
            <div class="step-label">
              {{ $t('app.plugin.market.standalone.install.step2') }}
            </div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <div class="step-number">{{ currentStep >= 3 ? '✓' : '3' }}</div>
            <div class="step-label">
              {{ $t('app.plugin.market.standalone.install.step3') }}
            </div>
          </div>
        </div>

        <!-- 环境检查 -->
        <div v-if="currentStep === 1" class="mt-5 environment-check">
          <ElTable :data="environmentChecks" style="width: 100%">
            <ElTableColumn
              prop="path"
              :label="$t('app.plugin.market.standalone.install.path')"
              width="300"
            />
            <ElTableColumn
              prop="requirement"
              :label="$t('app.plugin.market.standalone.install.requirement')"
            />
            <ElTableColumn
              :label="$t('app.plugin.market.standalone.install.status')"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <ElTag
                  :type="row.status === 'success' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ row.status === 'success' ? '✓' : '✗' }}
                </ElTag>
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="mt-4 flex justify-end">
            <ElButton @click="handleClose">
              {{ $t('app.plugin.market.standalone.install.cancel') }}
            </ElButton>
            <ElButton type="primary" @click="startInstallation">
              {{ $t('app.plugin.market.standalone.install.install') }}
            </ElButton>
          </div>
        </div>

        <!-- 安装进度 -->
        <div v-else-if="currentStep === 2" class="installation-progress mt-5">
          <ElProgress
            :percentage="installationProgress"
            :status="installationStatus as any"
          />
          <div class="mt-4">
            <div ref="logsContainer" class="installation-logs">
              <div
                v-for="(log, idx) in installationLogs"
                :key="idx"
                class="text-sm mb-1"
              >
                {{ log }}
              </div>
            </div>
          </div>
        </div>

        <!-- 安装完成 -->
        <div v-else-if="currentStep === 3" class="installation-complete">
          <div class="mt-2">
            <p class="text-sm font-medium text-gray-700 mb-2">
              {{ $t('app.plugin.market.standalone.install.log_title') }}：
            </p>
            <div ref="logsContainer" class="installation-logs">
              <div
                v-for="(log, idx) in installationLogs"
                :key="idx"
                class="text-sm mb-1"
                :class="{
                  'text-green-400':
                    idx === installationLogs.length - 1 &&
                    installationResult === 'success',
                  'text-red-400':
                    idx === installationLogs.length - 1 &&
                    installationResult === 'error',
                }"
              >
                {{ log }}
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <ElButton @click="handleClose">
              {{ $t('app.plugin.market.standalone.install.close') }}
            </ElButton>
            <ElButton
              v-if="installationResult === 'error'"
              type="warning"
              @click="handleRetry"
            >
              {{ $t('app.plugin.market.standalone.install.retry') }}
            </ElButton>
            <ElButton
              v-if="installationResult === 'success'"
              type="primary"
              @click="handleRefresh"
            >
              {{ $t('app.plugin.market.standalone.install.refresh') }}
            </ElButton>
          </div>
        </div>
      </div>
    </ElCard>
  </Dialog>
</template>

<style scoped>
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 600px;
  margin: 0 auto;
}

.step {
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--el-text-color-regular);
  background-color: var(--el-fill-color);
  border-radius: 50%;
  transition: all 0.3s;
}

.step-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  transition: all 0.3s;
}

.step.active .step-number {
  color: white;
  background-color: #409eff;
}

.step.active .step-label {
  font-weight: 500;
  color: #409eff;
}

.step.completed .step-number {
  color: white;
  background-color: #67c23a;
}

.step.completed .step-label {
  color: #67c23a;
}

.step-line {
  flex: 1;
  height: 2px;
  margin: 0 10px 24px;
  background-color: var(--el-fill-color);
  transition: all 0.3s;
}

.step-line.completed {
  background-color: #67c23a;
}

.installation-logs {
  max-height: 200px;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #d4d4d4;
  background-color: #1e1e1e;
  border-radius: 4px;
}

:deep(.el-card__body) {
  padding: 24px;
}

:deep(.el-dialog__header) {
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

:deep(.el-dialog__header .el-dialog__title) {
  color: white;
}
</style>
