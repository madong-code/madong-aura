<template>
  <Dialog>
    <el-card class="box-card !border-none" shadow="never">
      <div v-loading="loading">
        <!-- 步骤指示器 -->
        <div class="steps-indicator mb-6">
          <div
            class="step"
            :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
          >
            <div class="step-number">{{ currentStep >= 1 ? "✓" : "1" }}</div>
            <div class="step-label">卸载确认</div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
          <div
            class="step"
            :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
          >
            <div class="step-number">{{ currentStep >= 2 ? "✓" : "2" }}</div>
            <div class="step-label">卸载进度</div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <div class="step-number">{{ currentStep >= 3 ? "✓" : "3" }}</div>
            <div class="step-label">卸载完成</div>
          </div>
        </div>

        <!-- 卸载确认步骤 -->
        <div v-if="currentStep === 1" class="mt-5 uninstall-confirm">
          <el-alert
            title="卸载确认"
            type="warning"
            :closable="false"
            show-icon
            class="mb-4"
          >
            <template #default>
              <p class="mb-2">您确定要卸载模块 <strong>{{ module.name }}</strong> 吗？</p>
              <p class="text-sm text-gray-600">
                卸载将执行以下操作：
              </p>
              <ul class="text-sm text-gray-600 mt-2 ml-6 list-disc">
                <li>执行插件的卸载逻辑（清理数据）</li>
                <li>执行卸载 SQL 脚本（如果有）</li>
                <li>卸载插件菜单</li>
                <li>删除插件前端和资源文件</li>
                <li>删除插件记录</li>
              </ul>
              <p class="text-sm text-red-500 mt-2">⚠️ 此操作不可逆，请谨慎操作！</p>
            </template>
          </el-alert>
          <div class="mt-4 flex justify-end">
            <el-button @click="handleClose">取消</el-button>
            <el-button type="danger" @click="startUninstall">确认卸载</el-button>
          </div>
        </div>

        <!-- 卸载进度步骤 -->
        <div v-else-if="currentStep === 2" class="uninstall-progress mt-5">
          <el-progress :percentage="uninstallProgress" :status="(uninstallStatus as any)" />
          <div class="mt-4">
            <div class="uninstall-logs" ref="logsContainer">
              <div
                v-for="(log, index) in uninstallLogs"
                :key="index"
                class="text-sm mb-1"
              >
                {{ log }}
              </div>
            </div>
          </div>
        </div>

        <!-- 卸载完成步骤 -->
        <div v-else-if="currentStep === 3" class="uninstall-complete">
          <div class="mt-2">
            <p class="text-sm font-medium text-gray-700 mb-2">卸载执行日志：</p>
            <div class="uninstall-logs" ref="logsContainer">
              <div
                v-for="(log, index) in uninstallLogs"
                :key="index"
                class="text-sm mb-1"
                :class="{
                  'text-green-400': index === uninstallLogs.length - 1 && uninstallResult === 'success',
                  'text-red-400': index === uninstallLogs.length - 1 && uninstallResult === 'error'
                }"
              >
                {{ log }}
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <el-button @click="handleClose">关闭</el-button>
            <el-button
              type="primary"
              v-if="uninstallResult === 'success'"
              @click="handleRefresh"
              >刷新列表</el-button
            >
          </div>
        </div>
      </div>
    </el-card>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from "vue";
import { useDialog } from "@/components/dialog";
import request from "@/utils/http";

const [Dialog, dialogApi] = useDialog({
  title: "插件卸载",
  width: "800px",
  fullscreen: false,
  footer: false,
  draggable: true,
  closeOnClickModal: false,
  destroyOnClose: true,
});

// Props定义
const props = defineProps({
  module: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "refresh"]);

// 状态管理
const loading = ref(false);
const currentStep = ref(1);
const uninstallProgress = ref(0);
const uninstallStatus = ref<string>("");
const uninstallLogs = ref<string[]>([]);
const uninstallResult = ref<"success" | "error">("success");
const uninstallMessage = ref("");
const logsContainer = ref<HTMLElement>();

// SSE连接
let sse: EventSource | null = null;

// 打开对话框
const openDialog = async () => {
  if (!props.module || !props.module.code) {
    console.error("模块信息不完整，无法进行卸载");
    return;
  }

  dialogApi.open();
  currentStep.value = 1;
  uninstallProgress.value = 0;
  uninstallStatus.value = "";
  uninstallLogs.value = [];
  uninstallResult.value = "success";
  uninstallMessage.value = "";
};

// 关闭对话框
const handleClose = () => {
  if (sse) {
    sse.close();
    sse = null;
  }
  dialogApi.close();
  emit("close");
};

// 开始卸载
const startUninstall = async () => {
  currentStep.value = 2;
  uninstallProgress.value = 0;
  uninstallLogs.value = ["开始卸载..."];

  // 调用后端SSE卸载接口
  await startSseUninstall();
};

// 通过SSE卸载模块
const startSseUninstall = async () => {
  try {
    // 使用封装的SSE方法
    const sseConnection = request.sse(
      {
        url: "/plugin/uninstall",
        params: {
          code: props.module.code,
        },
      },
      {
        open: () => {
          console.log("SSE连接已打开");
        },
        progress: (data) => {
          console.log("进度事件:", data);
          // 解析SSE事件数据格式
          const eventData = data.data || data;
          if (eventData.progress !== undefined) {
            uninstallProgress.value = eventData.progress;
          }
          if (eventData.message) {
            uninstallLogs.value.push(eventData.message);
            // 滚动到日志底部
            nextTick(() => {
              if (logsContainer.value) {
                logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
              }
            });
          }
        },
        completed: (data) => {
          console.log("完成事件:", data);
          // 解析SSE事件数据格式
          const eventData = data.data || data;
          // 将完成消息添加到卸载日志
          if (eventData.message) {
            uninstallLogs.value.push(eventData.message);
            // 滚动到日志底部
            nextTick(() => {
              if (logsContainer.value) {
                logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
              }
            });
          }
          uninstallStatus.value = "success";
          currentStep.value = 3;
          uninstallResult.value = "success";
          uninstallMessage.value = eventData.message || `模块 ${props.module.name} 卸载成功！`;
          // 卸载完成后关闭SSE连接
          if (sse) {
            sse.close();
            sse = null;
          }
        },
        error: (data: any) => {
          console.log("错误事件:", data);
          // 解析SSE事件数据格式
          const eventData = data.data || data;
          // 只有当收到错误消息时才显示卸载失败
          // 注意：这里的error有两种情况：
          // 1. 连接错误（event.data可能不是JSON格式）
          // 2. 服务器发送的error事件（event: error）
          if (eventData.message) {
            // 将错误消息添加到卸载日志
            uninstallLogs.value.push(`错误: ${eventData.message}`);
            // 滚动到日志底部
            nextTick(() => {
              if (logsContainer.value) {
                logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
              }
            });
            uninstallStatus.value = "exception";
            currentStep.value = 3;
            uninstallResult.value = "error";
            uninstallMessage.value = `卸载失败: ${eventData.message || "未知错误"}`;
            // 卸载失败后关闭SSE连接
            if (sse) {
              sse.close();
              sse = null;
            }
          } else {
            // 连接错误（不是服务器发送的error事件）
            uninstallLogs.value.push(`SSE连接错误`);
            uninstallStatus.value = "exception";
            currentStep.value = 3;
            uninstallResult.value = "error";
            uninstallMessage.value = `卸载失败: SSE连接错误`;
          }
        },
        message: (data) => {
          console.log("消息事件:", data);
          // 解析SSE事件数据格式
          const eventData = data.data || data;
          if (eventData.message) {
            uninstallLogs.value.push(eventData.message);
            // 滚动到日志底部
            nextTick(() => {
              if (logsContainer.value) {
                logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
              }
            });
          }
        },
      }
    );

    // 保存SSE连接引用，以便后续关闭
    sse = sseConnection.eventSource;
  } catch (error) {
    console.error("卸载失败:", error);
    // 将错误消息添加到卸载日志
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    uninstallLogs.value.push(`错误: ${errorMessage}`);
    // 滚动到日志底部
    nextTick(() => {
      if (logsContainer.value) {
        logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
      }
    });
    uninstallStatus.value = "exception";
    currentStep.value = 3;
    uninstallResult.value = "error";
    uninstallMessage.value = `卸载失败: ${errorMessage}`;
  }
};

// 刷新列表
const handleRefresh = () => {
  emit("refresh");
  handleClose();
};

// 监听模块变化
watch(
  () => props.module,
  () => {
    if (dialogApi.getState().visible && props.module && props.module.code) {
      currentStep.value = 1;
      uninstallProgress.value = 0;
      uninstallStatus.value = "";
      uninstallLogs.value = [];
      uninstallResult.value = "success";
      uninstallMessage.value = "";
    }
  }
);

// 组件卸载时关闭SSE连接
onUnmounted(() => {
  if (sse) {
    sse.close();
    sse = null;
  }
});

defineExpose({
  openDialog,
});
</script>

<style scoped>
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 600px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step-label {
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background-color: #409eff;
  color: white;
}

.step.active .step-label {
  color: #409eff;
  font-weight: 500;
}

.step.completed .step-number {
  background-color: #67c23a;
  color: white;
}

.step.completed .step-label {
  color: #67c23a;
}

.step-line {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 10px;
  transition: all 0.3s ease;
}

.step-line.completed {
  background-color: #67c23a;
}

.uninstall-logs {
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  background-color: #1e1e1e;
  color: #d4d4d4;
  border-radius: 4px;
}

.result-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.result-message.success {
  color: #67c23a;
}

.result-message.error {
  color: #f56c6c;
}

::deep(.el-card__body) {
  padding: 24px;
}

::deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

::deep(.el-dialog__header .el-dialog__title) {
  color: white;
}
</style>
