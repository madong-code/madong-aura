<script setup lang="ts">
/** 模块详情对话框 — 100% 移植自 madong-vue module-detail */
import { nextTick, ref, watch } from 'vue';

import { ElButton, ElCard, ElIcon, ElTag } from 'element-plus';
import { Calendar, Key, RotateCw } from 'lucide-vue-next';

import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

import ModuleUninstallDialog from './module-uninstall-dialog.vue';
import { getCategoryLabel } from './store';

defineOptions({ name: 'ModuleDetail' });

const props = defineProps<{ moduleId: any }>();

const emit = defineEmits<{
  close: [];
  download: [module: any];
  refresh: [];
  uninstall: [module: any];
}>();

const [Dialog, dialogApi] = useDialog({
  title: $t('app.plugin.market.detail.title'),
  width: '700px',
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

const loading = ref(false);
const moduleData = ref<any>({});
const uninstallDialogRef = ref();

const openDialog = (mod?: any) => {
  dialogApi.open();
  loading.value = true;
  if (mod) moduleData.value = mod;
  setTimeout(() => {
    loading.value = false;
  }, 300);
};

const handleClose = () => {
  dialogApi.close();
  emit('close');
};
const handleDownload = () => {
  emit('download', moduleData.value);
  dialogApi.close();
};

const handleUninstall = async () => {
  await nextTick();
  uninstallDialogRef.value?.openDialog();
  dialogApi.close();
};

const handleUninstallRefresh = () => {
  emit('refresh');
};

watch(
  () => props.moduleId,
  () => {
    if (dialogApi.getState().visible) {
      loading.value = true;
      setTimeout(() => {
        loading.value = false;
      }, 200);
    }
  },
);

defineExpose({ openDialog });
</script>

<template>
  <div>
    <Dialog>
      <ElCard class="box-card !border-none" shadow="never">
        <div v-loading="loading">
          <!-- 模块基本信息 -->
          <div class="module-info-section mb-6">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div
                  class="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center border-2 border-blue-200 dark:border-blue-800"
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
                      class="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-2xl"
                    >
                      📦
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h2
                  class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
                >
                  {{ moduleData.name }}
                </h2>
                <div class="space-y-2">
                  <div
                    class="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <ElIcon class="mr-2" :size="16"><Key /></ElIcon>
                    <span class="font-mono">ID: {{ moduleData.id }}</span>
                  </div>
                  <div
                    class="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <ElIcon class="mr-2" :size="16"><RotateCw /></ElIcon>
                    <span>{{
                      $t('app.plugin.market.detail.version', {
                        ver: moduleData.version || '1.0.0',
                      })
                    }}</span>
                  </div>
                  <div
                    class="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <ElIcon class="mr-2" :size="16"><Calendar /></ElIcon>
                    <span>{{
                      $t('app.plugin.market.detail.update_time', {
                        time: moduleData.update_time || '-',
                      })
                    }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <ElTag
                      :type="moduleData.is_installed ? 'success' : 'info'"
                      size="small"
                    >
                      {{
                        moduleData.is_installed
                          ? $t('app.plugin.market.installed_tag')
                          : $t('app.plugin.market.uninstalled_tag')
                      }}
                    </ElTag>
                    <ElTag
                      v-if="moduleData.purchased"
                      type="warning"
                      size="small"
                    >
                      {{
                        $t('app.plugin.market.standalone.categories.purchased')
                      }}
                    </ElTag>
                    <ElTag v-if="moduleData.is_new" type="success" size="small">
                      {{ $t('app.plugin.market.new_module') }}
                    </ElTag>
                    <ElTag v-if="moduleData.is_hot" type="danger" size="small">
                      {{ $t('app.plugin.market.hot') }}
                    </ElTag>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 模块描述 -->
          <div class="description-section mb-6">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3"
            >
              {{ $t('app.plugin.market.detail.intro') }}
            </h3>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {{
                  moduleData.description ||
                  $t('app.plugin.market.detail.no_desc')
                }}
              </p>
            </div>
          </div>

          <!-- 详细描述 -->
          <div
            class="detail-description-section mb-6"
            v-if="moduleData.detail_description"
          >
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3"
            >
              {{ $t('app.plugin.market.detail.detail_desc') }}
            </h3>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p
                class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
              >
                {{ moduleData.detail_description }}
              </p>
            </div>
          </div>

          <!-- 分类信息 -->
          <div class="category-section mb-6">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3"
            >
              {{ $t('app.plugin.market.standalone.detail.category') }}
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {{ $t('app.plugin.market.standalone.detail.category') }}
                </div>
                <div class="font-medium">
                  {{
                    $t(
                      `app.plugin.market.categories.${getCategoryLabel(
                        moduleData.category,
                      )}`,
                    )
                  }}
                </div>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {{ $t('app.plugin.market.standalone.detail.support_app') }}
                </div>
                <div class="font-mono text-sm">
                  {{ moduleData.code || moduleData.id }}
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-section">
            <div class="flex space-x-3 justify-end">
              <ElButton @click="handleClose" size="large">
                {{ $t('app.plugin.market.detail.close') }}
              </ElButton>
              <ElButton
                v-if="moduleData.is_installed && !moduleData.undeletable"
                type="danger"
                size="large"
                @click="handleUninstall"
              >
                {{ $t('app.plugin.market.standalone.uninstall.immediate') }}
              </ElButton>
              <ElButton
                v-else-if="moduleData.purchased && !moduleData.is_installed"
                type="primary"
                size="large"
                @click="handleDownload"
              >
                {{ $t('app.plugin.market.standalone.download.immediate') }}
              </ElButton>
              <ElButton
                v-else-if="moduleData.purchased && moduleData.has_update"
                type="warning"
                size="large"
                @click="handleDownload"
              >
                {{ $t('app.plugin.market.standalone.update.immediate') }}
              </ElButton>
              <ElButton
                v-else-if="!moduleData.is_installed"
                type="primary"
                size="large"
                @click="handleDownload"
              >
                {{ $t('app.plugin.market.standalone.install.immediate') }}
              </ElButton>
            </div>
          </div>
        </div>
      </ElCard>
    </Dialog>

    <!-- 卸载对话框 -->
    <ModuleUninstallDialog
      ref="uninstallDialogRef"
      :plugin="moduleData"
      @close="handleClose"
      @refresh="handleUninstallRefresh"
    />
  </div>
</template>

<style scoped>
.module-info-section {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.description-section,
.detail-description-section,
.category-section,
.action-section {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.action-section {
  padding-bottom: 0;
  border-bottom: none;
}

:deep(.el-card__body) {
  padding: 24px;
}

:deep(.el-dialog__header) {
  background: linear-gradient(
    135deg,
    var(--el-color-primary) 0%,
    var(--el-color-primary-dark-2) 100%
  );
}

:deep(.el-dialog__header .el-dialog__title) {
  color: white;
}
</style>
