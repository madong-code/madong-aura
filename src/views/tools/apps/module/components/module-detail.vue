<template>
  <div>
    <Dialog>
      <el-card class="box-card !border-none" shadow="never">
        <div v-loading="loading">
          <!-- 模块基本信息 -->
          <div class="module-info-section mb-6">
            <div class="flex items-start space-x-4">
              <!-- 模块图标 -->
              <div class="flex-shrink-0">
                <div
                  class="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-2 border-blue-200"
                >
                  <div class="w-16 h-16 overflow-hidden rounded">
                    <img
                      v-if="moduleData.poster"
                      :src="moduleData.poster"
                      :alt="moduleData.name"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center bg-blue-100"
                    >
                      <art-svg-icon
                        :icon="getModuleIcon(typeof moduleData.category === 'string' ? moduleData.category : 'all')"
                        :size="32"
                        class="text-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 模块基本信息 -->
              <div class="flex-1 min-w-0">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                  {{ moduleData.name }}
                </h2>
                <div class="space-y-2">
                  <div class="flex items-center text-sm text-gray-600">
                    <art-svg-icon icon="ri:key-line" class="mr-2" size="16" />
                    <span class="font-mono">ID: {{ moduleData.id }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <art-svg-icon icon="ri:git-branch-line" class="mr-2" size="16" />
                    <span>版本: {{ moduleData.version || "1.0.0" }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <art-svg-icon icon="ri:calendar-line" class="mr-2" size="16" />
                    <span>更新时间: {{ moduleData.update_time || "-" }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <el-tag
                      :type="moduleData.is_installed ? 'success' : 'info'"
                      size="small"
                    >
                      {{ moduleData.is_installed ? "已安装" : "未安装" }}
                    </el-tag>
                    <el-tag v-if="moduleData.purchased" type="warning" size="small">
                      已购买
                    </el-tag>
                    <el-tag v-if="moduleData.is_new" type="success" size="small">
                      新模块
                    </el-tag>
                    <el-tag v-if="moduleData.is_hot" type="danger" size="small">
                      热门
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 模块描述 -->
          <div class="description-section mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">模块简介</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700 leading-relaxed">
                {{ moduleData.description || "暂无描述" }}
              </p>
            </div>
          </div>

          <!-- 详细描述 -->
          <div
            class="detail-description-section mb-6"
            v-if="moduleData.detail_description"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-3">详细说明</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {{ moduleData.detail_description }}
              </p>
            </div>
          </div>

          <!-- 模块分类信息 -->
          <div class="category-section mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">分类信息</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-sm text-gray-500 mb-1">分类</div>
                <div class="font-medium">{{ getCategoryLabel(typeof moduleData.category === 'string' ? moduleData.category : 'all') }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-sm text-gray-500 mb-1">应用标识</div>
                <div class="font-mono text-sm">
                  {{ moduleData.code || moduleData.id }}
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-section">
            <div class="flex space-x-3 justify-end">
              <el-button @click="handleClose" size="large">关闭</el-button>
              <el-button
                v-if="moduleData.is_installed && !moduleData.undeletable"
                type="danger"
                size="large"
                @click="handleUninstall"
              >
                <art-svg-icon icon="ri:uninstall-line" class="mr-1" />
                立即卸载
              </el-button>
              <el-button
                v-else-if="moduleData.purchased && !moduleData.is_installed"
                type="primary"
                size="large"
                @click="handleDownload"
              >
                <art-svg-icon icon="ri:download-line" class="mr-1" />
                立即下载
              </el-button>
              <el-button
                v-else-if="moduleData.purchased && moduleData.has_update"
                type="warning"
                size="large"
                @click="handleDownload"
              >
                <art-svg-icon icon="ri:refresh-line" class="mr-1" />
                立即更新
              </el-button>
              <el-button
                v-else-if="!moduleData.is_installed"
                type="primary"
                size="large"
                @click="handleDownload"
              >
                <art-svg-icon icon="ri:download-line" class="mr-1" />
                立即安装
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </Dialog>

    <!-- 卸载对话框 -->
    <ModuleUninstallDialog
      ref="uninstallDialogRef"
      :module="moduleData"
      @close="handleClose"
      @refresh="handleUninstallRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { getModuleIcon, getCategoryLabel } from "../store";
import { Module } from "@/api/tools/apps/module/types";
import { useDialog } from "@/components/dialog";
import ModuleUninstallDialog from "./module-uninstall-dialog.vue";

const [Dialog, dialogApi] = useDialog({
  title: "模块详情",
  width: "700px",
  fullscreen: false,
  footer: false,
  draggable: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  onConfirm: () => {
    dialogApi.close();
  },
  onCancel: () => {
    handleClose();
  },
});

// Props定义
const props = defineProps({
  moduleId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["close", "download", "uninstall", "refresh"]);

// 状态管理
const loading = ref(false);
const moduleData = ref<Module>({} as Module);

// 卸载对话框引用
const uninstallDialogRef = ref();

// 打开对话框
const openDialog = (module?: Module) => {
  dialogApi.open();
  loading.value = true;

  if (module) {
    moduleData.value = module;
  }

  // 模拟加载延迟
  setTimeout(() => {
    loading.value = false;
  }, 300);
};

// 关闭对话框
const handleClose = () => {
  dialogApi.close();
  emit("close");
};

// 下载模块
const handleDownload = () => {
  emit("download", moduleData.value);
  dialogApi.close();
};

// 卸载模块
const handleUninstall = async () => {
  // 打开卸载对话框
  await nextTick();
  if (uninstallDialogRef.value) {
    await uninstallDialogRef.value.openDialog();
  }
  // 关闭详情对话框
  dialogApi.close();
};

// 卸载完成后刷新
const handleUninstallRefresh = () => {
  emit("refresh");
};

// 监听moduleId变化
watch(
  () => props.moduleId,
  () => {
    if (dialogApi.getState().visible) {
      loading.value = true;
      setTimeout(() => {
        loading.value = false;
      }, 200);
    }
  }
);

defineExpose({
  openDialog,
});
</script>

<style scoped>
.module-info-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1.5rem;
}

.description-section,
.detail-description-section,
.category-section,
.action-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1.5rem;
}

.action-section {
  border-bottom: none;
  padding-bottom: 0;
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
