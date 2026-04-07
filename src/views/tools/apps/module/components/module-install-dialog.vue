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
            <div class="step-label">环境检查</div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
          <div
            class="step"
            :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
          >
            <div class="step-number">{{ currentStep >= 2 ? "✓" : "2" }}</div>
            <div class="step-label">安装进度</div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <div class="step-number">{{ currentStep >= 3 ? "✓" : "3" }}</div>
            <div class="step-label">安装完成</div>
          </div>
        </div>

        <!-- 环境检查步骤 -->
        <div v-if="currentStep === 1" class="mt-5 environment-check">
          <!-- <h3 class="text-lg font-semibold mb-4">环境检查</h3> -->
          <el-table :data="environmentChecks" style="width: 100%">
            <el-table-column prop="path" label="路径" width="300" />
            <el-table-column prop="requirement" label="要求" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 'success' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ row.status === "success" ? "✓" : "✗" }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt-4 flex justify-end">
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="startInstallation">开始安装</el-button>
          </div>
        </div>

        <!-- 安装进度步骤 -->
        <div v-else-if="currentStep === 2" class="installation-progress mt-5">
          <!-- <h3 class="text-lg font-semibold mb-4">安装进度</h3> -->
          <el-progress :percentage="installationProgress" :status="installationStatus" />
          <div class="mt-4">
            <div class="installation-logs" ref="logsContainer">
              <div
                v-for="(log, index) in installationLogs"
                :key="index"
                class="text-sm mb-1"
              >
                {{ log }}
              </div>
            </div>
          </div>
        </div>

        <!-- 安装完成步骤 -->
        <div v-else-if="currentStep === 3" class="installation-complete">
          <div class="mt-2">
            <p class="text-sm font-medium text-gray-700 mb-2">安装执行日志：</p>
            <div class="installation-logs" ref="logsContainer">
              <div
                v-for="(log, index) in installationLogs"
                :key="index"
                class="text-sm mb-1"
                :class="{
                  'text-green-400': index === installationLogs.length - 1 && installationResult === 'success',
                  'text-red-400': index === installationLogs.length - 1 && installationResult === 'error'
                }"
              >
                {{ log }}
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <el-button @click="handleClose">关闭</el-button>
            <el-button
              type="warning"
              v-if="installationResult === 'error'"
              @click="handleRetry"
              >重试安装</el-button
            >
            <el-button
              type="primary"
              v-if="installationResult === 'success'"
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
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useDialog } from "@/components/dialog";
import AppsService from "@/api/tools/apps/module";
import request from "@/utils/http";

const [Dialog, dialogApi] = useDialog({
  title: "插件安装",
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
const environmentChecks = ref([]);
const installationProgress = ref(0);
const installationStatus = ref<string>("");
const installationLogs = ref<string[]>([]);
const installationResult = ref<"success" | "error">("success");
const installationMessage = ref("");
const logsContainer = ref<HTMLElement>();

// SSE连接
let sse: EventSource | null = null;

// 打开对话框
const openDialog = async () => {
  // 检查模块信息是否存在
  if (!props.module || !props.module.name) {
    console.error("模块信息不完整，无法进行环境检测");
    return;
  }

  dialogApi.open();
  currentStep.value = 1;
  installationProgress.value = 0;
  installationStatus.value = "";
  installationLogs.value = [];
  installationResult.value = "success";
  installationMessage.value = "";

  // 加载环境检测结果
  await loadEnvironmentChecks();
};

// 加载环境检测结果
const loadEnvironmentChecks = async () => {
  try {
    loading.value = true;
    console.log("开始环境检测，模块名称:", props.module.name);
    const response = await AppsService.checkEnvironment({
      name: props.module.name,
      timestamp: Date.now(),
    });
    console.log("环境检测响应:", response);
    if (response && response.paths) {
      environmentChecks.value = response.paths.map((item: any) => ({
        path: item.path,
        requirement: item.requirement === "readable" ? "可读" : "可写",
        status: item.status,
      }));
      console.log("环境检测结果:", environmentChecks.value);
    } else {
      console.error("环境检测响应格式错误:", response);
      environmentChecks.value = [];
    }
  } catch (error) {
    console.error("环境检测失败:", error);
    environmentChecks.value = [];
    // 可以添加错误提示
  } finally {
    loading.value = false;
  }
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

// 开始安装
const startInstallation = async () => {
  currentStep.value = 2;
  installationProgress.value = 0;
  installationLogs.value = ["开始安装..."];

  // 调用后端SSE安装接口
  await startSseInstallation();
};

// 通过SSE安装模块
const startSseInstallation = async () => {
  try {
    // 获取安装模式：本地插件直接安装，远程插件下载后安装
    const installMode = props.module.is_local === 1 ? 'local' : 'remote';

    // 使用封装的SSE方法
    const sseConnection = request.sse(
      {
        url: "/plugin/install",
        params: {
          code: props.module.code,
          mode: installMode,
        },
      },
      {
        open: () => {
          console.log("SSE连接已打开");
        },
        progress: (data) => {
          // 解析SSE事件数据格式
          const eventData = data.data || data;
          if (eventData.progress !== undefined) {
            installationProgress.value = eventData.progress;
          }
          if (eventData.message) {
            installationLogs.value.push(eventData.message);
            // 滚动到日志底部
            nextTick(() => {
              if (logsContainer.value) {
                logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
              }
            });
          }
        },
        completed: (data) => {
          // 解析SSE事件数据格式
          const eventData = data.data || data;
          // 将完成消息添加到安装日志
          if (eventData.message) {
            installationLogs.value.push(eventData.message);
            // 滚动到日志底部
            nextTick(() => {
              if (logsContainer.value) {
                logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
              }
            });
          }
          installationStatus.value = "success";
          currentStep.value = 3;
          installationResult.value = "success";
          installationMessage.value = `模块 ${props.module.name} 安装成功！`;
          // 安装完成后关闭SSE连接
          if (sse) {
            sse.close();
            sse = null;
          }
        },
        error: (data) => {
          // 解析SSE事件数据格式
          const eventData = data.data || data;
          console.log("SSE错误事件:", data);
          // 只有当收到错误消息时才显示安装失败
          if (eventData.message) {
            // 将错误消息添加到安装日志
            installationLogs.value.push(`错误: ${eventData.message}`);
            // 滚动到日志底部
            nextTick(() => {
              if (logsContainer.value) {
                logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
              }
            });
            installationStatus.value = "exception";
            currentStep.value = 3;
            installationResult.value = "error";
            installationMessage.value = `安装失败: ${eventData.message || "未知错误"}`;
            // 安装失败后关闭SSE连接
            if (sse) {
              sse.close();
              sse = null;
            }
          }
        },
        message: (data) => {
          // 解析SSE事件数据格式
          const eventData = data.data || data;
          if (eventData.message) {
            installationLogs.value.push(eventData.message);
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
    console.error("安装失败:", error);
    // 将错误消息添加到安装日志
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    installationLogs.value.push(`错误: ${errorMessage}`);
    // 滚动到日志底部
    nextTick(() => {
      if (logsContainer.value) {
        logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
      }
    });
    installationStatus.value = "exception";
    currentStep.value = 3;
    installationResult.value = "error";
    installationMessage.value = `安装失败: ${errorMessage}`;
  }
};

// 刷新列表
const handleRefresh = () => {
  emit("refresh");
  handleClose();
};

// 重试安装
const handleRetry = () => {
  // 重置状态到第2步
  currentStep.value = 2;
  installationProgress.value = 0;
  installationLogs.value = ["开始重新安装..."];
  installationStatus.value = "";
  installationResult.value = "success";
  installationMessage.value = "";

  // 重新开始安装
  startSseInstallation();
};

// 监听模块变化
watch(
  () => props.module,
  async () => {
    if (dialogApi.getState().visible && props.module && props.module.name) {
      currentStep.value = 1;
      installationProgress.value = 0;
      installationStatus.value = "";
      installationLogs.value = [];
      installationResult.value = "success";
      installationMessage.value = "";
      // 重新加载环境检测结果
      await loadEnvironmentChecks();
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

.installation-logs {
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

:deep(.el-card__body) {
  padding: 24px;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

:deep(.el-dialog__header .el-dialog__title) {
  color: white;
}
</style>
