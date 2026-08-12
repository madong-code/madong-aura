<script setup lang="ts">
/** 授权版模块详情对话框 - 无删除功能 */
import { ref } from 'vue';

import { ElButton, ElCard, ElIcon, ElMessage, ElTag } from 'element-plus';
import { Calendar, Key, RotateCw } from 'lucide-vue-next';

import { requestClient } from '#/api/request';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

defineOptions({ name: 'GrantedModuleDetail' });

const _props = defineProps<{ moduleId: any }>();

const emit = defineEmits<{
  close: [];
  install: [module: any];
  refresh: [];
  uninstall: [module: any];
  update: [module: any];
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

const handleInstall = () => {
  emit('install', moduleData.value);
  dialogApi.close();
};

const handleUninstall = async () => {
  emit('uninstall', moduleData.value);
  dialogApi.close();
};

const handleUpdate = async () => {
  try {
    await requestClient.post(
      `/tenant/plugin/${moduleData.value.code}/update-db`,
    );
    ElMessage.success(
      $t('app.plugin.market.update.success', { name: moduleData.value.name }),
    );
    emit('update', moduleData.value);
    dialogApi.close();
  } catch (error: any) {
    ElMessage.error(error?.message || $t('app.plugin.market.update.fail'));
  }
};

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

          <!-- 操作按钮（无删除） -->
          <div class="action-section">
            <div class="flex space-x-3 justify-end">
              <ElButton @click="handleClose" size="large">
                {{ $t('app.plugin.market.detail.close') }}
              </ElButton>
              <ElButton
                v-if="moduleData.is_installed"
                type="danger"
                size="large"
                @click="handleUninstall"
              >
                {{ $t('app.plugin.market.uninstall_menu') }}
              </ElButton>
              <ElButton
                v-else-if="moduleData.has_update"
                type="warning"
                size="large"
                @click="handleUpdate"
              >
                {{ $t('app.plugin.market.update_db') }}
              </ElButton>
              <ElButton
                v-else
                type="primary"
                size="large"
                @click="handleInstall"
              >
                {{ $t('app.plugin.market.install_menu') }}
              </ElButton>
            </div>
          </div>
        </div>
      </ElCard>
    </Dialog>
  </div>
</template>

<style scoped>
.module-info-section {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.description-section,
.detail-description-section,
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
