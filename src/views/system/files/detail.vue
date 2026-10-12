<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { useClipboard } from '@vueuse/core';
import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElDrawer,
  ElImage,
  ElInput,
  ElMessage,
  ElTag,
} from 'element-plus';

import { $t } from '#/locales';

import { fileUrl, isImageFile } from './schemas';

const props = withDefaults(
  defineProps<{
    row?: null | Record<string, any>;
    visible?: boolean;
  }>(),
  { row: null, visible: false },
);

const emit = defineEmits<{ 'update:visible': [boolean] }>();

const drawerVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const { copy } = useClipboard({ legacy: true });

/**
 * 打开期间保留最后一次记录
 *
 * 抽屉关闭动画期间 row 会被清空，直接绑定 props 会导致内容闪空。
 */
const detail = ref<null | Record<string, any>>(null);
watch(
  () => props.row,
  (value) => {
    if (value) {
      detail.value = value;
    }
  },
  { immediate: true },
);

const isImage = computed(() => isImageFile(detail.value ?? {}));

const accessUrl = computed(() => fileUrl(detail.value ?? {}));

/** 私有空间资源地址为带签名的临时直链 */
const isPrivate = computed(() => detail.value?.space === 'private');

const spaceText = computed(() =>
  isPrivate.value
    ? $t('system.files.detail.space_private')
    : $t('system.files.detail.space_public'),
);

/** 来源：default=系统，plugin:{code}=插件归属 */
const sourceText = computed(() => {
  const source = String(detail.value?.source ?? 'default');
  return source.startsWith('plugin:')
    ? $t('system.files.detail.source_plugin', [source.slice(7)])
    : $t('system.files.detail.source_default');
});

async function handleCopy() {
  if (!accessUrl.value) {
    return;
  }
  await copy(accessUrl.value);
  ElMessage.success($t('system.files.detail.copy_success'));
}

function handleOpen() {
  if (accessUrl.value) {
    window.open(accessUrl.value, '_blank');
  }
}
</script>

<template>
  <ElDrawer
    v-model="drawerVisible"
    :title="$t('system.files.detail.title')"
    size="620px"
    append-to-body
  >
    <div class="file-detail">
      <div class="file-detail__section">
        {{ $t('system.files.detail.basic_info') }}
      </div>

      <div class="file-detail__preview">
        <ElImage
          v-if="isImage && accessUrl"
          :src="accessUrl"
          :preview-src-list="[accessUrl]"
          preview-teleported
          fit="contain"
          class="file-detail__image"
        />
        <div v-else class="file-detail__placeholder">
          <span class="file-detail__ext">
            {{ (detail?.ext || 'FILE').toUpperCase() }}
          </span>
          <span class="file-detail__tip">
            {{ $t('system.files.detail.preview_unsupported') }}
          </span>
        </div>
      </div>

      <ElDescriptions :column="1" border class="file-detail__info">
        <ElDescriptionsItem :label="$t('system.files.detail.filename')">
          {{ detail?.filename || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('system.files.detail.original_filename')">
          {{ detail?.original_filename || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('system.files.detail.content_type')">
          {{ detail?.content_type || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('system.files.detail.size_info')">
          {{ detail?.size_info || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('system.files.detail.platform')">
          {{ detail?.platform || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('system.files.detail.space')">
          <ElTag :type="isPrivate ? 'warning' : 'success'" size="small">
            {{ spaceText }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('system.files.detail.source')">
          {{ sourceText }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('system.files.detail.created_name')">
          {{ detail?.createds?.created_name || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('system.files.detail.created_date')">
          {{ detail?.created_date || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('system.files.detail.link')">
          <ElInput :model-value="accessUrl" readonly>
            <template #append>
              <ElButton :disabled="!accessUrl" @click="handleCopy">
                {{ $t('system.files.detail.copy') }}
              </ElButton>
            </template>
          </ElInput>
          <p v-if="isPrivate" class="file-detail__hint">
            {{ $t('system.files.detail.private_hint') }}
          </p>
        </ElDescriptionsItem>
      </ElDescriptions>

      <p class="file-detail__path">
        <span class="file-detail__path-label">
          {{ $t('system.files.detail.path') }}
        </span>
        {{ detail?.base_path || detail?.path || '-' }}
      </p>
    </div>

    <template #footer>
      <ElButton @click="drawerVisible = false">
        {{ $t('system.files.detail.close') }}
      </ElButton>
      <ElButton type="primary" :disabled="!accessUrl" @click="handleOpen">
        {{ $t('system.files.detail.open') }}
      </ElButton>
    </template>
  </ElDrawer>
</template>

<style scoped>
.file-detail__section {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.file-detail__section::before {
  width: 3px;
  height: 14px;
  margin-right: 8px;
  content: '';
  background: var(--el-color-primary);
  border-radius: 2px;
}

.file-detail__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260px;
  margin-bottom: 16px;
  overflow: hidden;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.file-detail__image {
  width: 100%;
  height: 100%;
}

.file-detail__placeholder {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  color: var(--el-text-color-secondary);
}

.file-detail__ext {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.file-detail__tip {
  font-size: 12px;
}

.file-detail__info {
  margin-bottom: 12px;
}

.file-detail__hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--el-text-color-secondary);
}

.file-detail__path {
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}

.file-detail__path-label {
  margin-right: 4px;
  color: var(--el-text-color-regular);
}
</style>
