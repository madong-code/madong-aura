<script lang="ts" setup>
import type { UploadRequestOptions } from 'element-plus';

import { computed, ref, watch } from 'vue';

import { useClipboard } from '@vueuse/core';
import {
  ElButton,
  ElDialog,
  ElInput,
  ElMessage,
  ElRadioButton,
  ElRadioGroup,
  ElTabPane,
  ElTabs,
  ElUpload,
} from 'element-plus';

import { FilesService } from '#/api/system';
import { $t } from '#/locales';

import { fileUrl } from './schemas';

const props = withDefaults(defineProps<{ visible?: boolean }>(), {
  visible: false,
});

const emit = defineEmits<{ 'update:visible': [boolean]; success: [] }>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const { copy } = useClipboard({ legacy: true });

/** 上传类型：图片 / 普通附件 */
type UploadKind = 'file' | 'image';

/** 上传结果条目 */
interface UploadResult {
  error?: string;
  name: string;
  size: string;
  url: string;
}

const IMAGE_ACCEPT = 'image/*';
const FILE_ACCEPT = '.doc,.docx,.xls,.xlsx,.pdf,.txt,.zip,.rar,.7z';

const activeTab = ref('local');
const kind = ref<UploadKind>('image');
const subDir = ref('image');
const remoteUrls = ref('');
/** 进行中的上传任务数（多选并发上传时只有全部结束才算空闲） */
const pendingCount = ref(0);
const results = ref<UploadResult[]>([]);

const uploading = computed(() => pendingCount.value > 0);

const accept = computed(() =>
  kind.value === 'image' ? IMAGE_ACCEPT : FILE_ACCEPT,
);

const successResults = computed(() => results.value.filter((item) => !item.error));

/** 切换上传类型时同步默认子目录，避免图片与附件混放 */
watch(kind, (value) => {
  subDir.value = value === 'image' ? 'image' : 'file';
});

/** 每次打开重置为初始状态 */
watch(
  () => props.visible,
  (value) => {
    if (value) {
      results.value = [];
      remoteUrls.value = '';
      pendingCount.value = 0;
    }
  },
);

/** 归一化上传响应为结果条目 */
function toResult(name: string, response: Record<string, any>): UploadResult {
  return {
    name: response?.filename || name,
    size: response?.size_info || '-',
    url: fileUrl(response),
  };
}

function pushResult(result: UploadResult) {
  results.value.unshift(result);
}

/** 单文件上传：由 ElUpload 逐个文件回调 */
async function handleRequest(options: UploadRequestOptions) {
  const file = options.file as File;
  pendingCount.value += 1;
  try {
    const response = (await (kind.value === 'image'
      ? FilesService.uploadImage({ file, sub_dir: subDir.value })
      : FilesService.uploadAttachment({
          file,
          sub_dir: subDir.value,
        }))) as Record<string, any>;
    pushResult(toResult(file.name, response));
    options.onSuccess?.(response);
  } catch (error: any) {
    pushResult({
      name: file.name,
      size: '-',
      url: '',
      error: error?.message || $t('system.files.upload.failed'),
    });
    options.onError?.(error);
  } finally {
    pendingCount.value -= 1;
  }
}

/** 批量拉取远程图片 */
async function handleFetch() {
  const urls = remoteUrls.value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  if (!urls.length) {
    ElMessage.warning($t('system.files.upload.remote_required'));
    return;
  }

  pendingCount.value = 1;
  try {
    for (const url of urls) {
      try {
        const response = (await FilesService.fetchAndSaveImage({
          url,
          sub_dir: subDir.value,
        })) as Record<string, any>;
        pushResult(toResult(url.split('/').pop() || url, response));
      } catch (error: any) {
        pushResult({
          name: url,
          size: '-',
          url: '',
          error: error?.message || $t('system.files.upload.failed'),
        });
      }
    }
  } finally {
    pendingCount.value = 0;
  }
}

async function handleCopy(url: string) {
  if (!url) {
    return;
  }
  await copy(url);
  ElMessage.success($t('system.files.upload.copy_success'));
}

async function handleCopyAll() {
  const links = successResults.value.map((item) => item.url).filter(Boolean);
  if (!links.length) {
    return;
  }
  await copy(links.join('\n'));
  ElMessage.success($t('system.files.upload.copy_success'));
}

function handleClose() {
  dialogVisible.value = false;
  if (successResults.value.length) {
    emit('success');
  }
}
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    :title="$t('system.files.upload.title')"
    width="680px"
    append-to-body
    @close="handleClose"
  >
    <ElTabs v-model="activeTab">
      <ElTabPane :label="$t('system.files.upload.tab_local')" name="local">
        <div class="file-upload__kind">
          <span class="file-upload__label">
            {{ $t('system.files.upload.kind') }}
          </span>
          <ElRadioGroup v-model="kind" :disabled="uploading">
            <ElRadioButton value="image">
              {{ $t('system.files.upload.kind_image') }}
            </ElRadioButton>
            <ElRadioButton value="file">
              {{ $t('system.files.upload.kind_file') }}
            </ElRadioButton>
          </ElRadioGroup>
        </div>

        <ElUpload
          drag
          multiple
          :accept="accept"
          :disabled="uploading"
          :show-file-list="false"
          :http-request="handleRequest"
          class="file-upload__drop"
        >
          <div class="file-upload__drop-text">
            {{ $t('system.files.upload.drag_text') }}
          </div>
          <div class="file-upload__drop-hint">
            {{
              kind === 'image'
                ? $t('system.files.upload.drag_hint_image')
                : $t('system.files.upload.drag_hint_file')
            }}
          </div>
        </ElUpload>
      </ElTabPane>

      <ElTabPane :label="$t('system.files.upload.tab_remote')" name="remote">
        <div class="file-upload__label file-upload__label--block">
          {{ $t('system.files.upload.remote_label') }}
        </div>
        <ElInput
          v-model="remoteUrls"
          type="textarea"
          :rows="5"
          :placeholder="$t('system.files.upload.remote_placeholder')"
        />
        <ElButton
          type="primary"
          class="file-upload__fetch"
          :loading="uploading"
          @click="handleFetch"
        >
          {{ $t('system.files.upload.remote_button') }}
        </ElButton>
      </ElTabPane>
    </ElTabs>

    <div class="file-upload__sub-dir">
      <span class="file-upload__label">
        {{ $t('system.files.upload.sub_dir') }}
      </span>
      <ElInput v-model="subDir" :disabled="uploading" />
      <p class="file-upload__hint">
        {{ $t('system.files.upload.sub_dir_hint') }}
      </p>
    </div>

    <div v-if="results.length" class="file-upload__results">
      <div class="file-upload__label file-upload__label--block">
        {{ $t('system.files.upload.results') }}
      </div>
      <div v-for="(item, index) in results" :key="index" class="file-upload__item">
        <div class="file-upload__item-main">
          <span class="file-upload__item-name">{{ item.name }}</span>
          <span class="file-upload__item-size">{{ item.size }}</span>
        </div>
        <span v-if="item.error" class="file-upload__item-error">
          {{ item.error }}
        </span>
        <ElButton v-else link type="primary" @click="handleCopy(item.url)">
          {{ $t('system.files.upload.copy') }}
        </ElButton>
      </div>
      <p class="file-upload__hint">{{ $t('system.files.upload.dedup_hint') }}</p>
    </div>

    <template #footer>
      <ElButton v-if="successResults.length" @click="handleCopyAll">
        {{ $t('system.files.upload.copy_all') }}
      </ElButton>
      <ElButton type="primary" @click="handleClose">
        {{ $t('system.files.upload.close') }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.file-upload__label {
  margin-right: 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.file-upload__label--block {
  display: block;
  margin-bottom: 8px;
}

.file-upload__kind {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.file-upload__drop :deep(.el-upload-dragger) {
  padding: 28px 16px;
}

.file-upload__drop-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.file-upload__drop-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.file-upload__fetch {
  margin-top: 12px;
}

.file-upload__sub-dir {
  margin-top: 16px;
}

.file-upload__hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--el-text-color-secondary);
}

.file-upload__results {
  max-height: 220px;
  margin-top: 16px;
  overflow-y: auto;
}

.file-upload__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.file-upload__item-main {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.file-upload__item-name {
  overflow: hidden;
  font-size: 13px;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-upload__item-size {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.file-upload__item-error {
  font-size: 12px;
  color: var(--el-color-danger);
}
</style>
