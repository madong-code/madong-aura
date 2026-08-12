<!-- 图片选择弹窗 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { ElMessage } from 'element-plus';

import { requestClient } from '#/api/request';
import { Icon } from '#/components/icon';
import { $t } from '#/locales';
import { buildStaticUrl } from '#/utils/url';

interface Props {
  modelValue: boolean;
  multiple?: boolean;
  defaultSelected?: null | string | string[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  multiple: false,
  defaultSelected: null,
});

const emit = defineEmits<{
  confirm: [images: string | string[]];
  'update:modelValue': [modelValue: boolean];
}>();

const loading = ref(false);
const searchKeyword = ref('');
const page = ref(1);
const pageSize = ref(12);
const total = ref(0);
const imageList = ref<any[]>([]);
const selectedImages = ref<any[]>([]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

watch(
  () => props.defaultSelected,
  (val) => {
    if (!val) {
      selectedImages.value = [];
    } else if (props.multiple) {
      selectedImages.value = Array.isArray(val) ? val : [val];
    } else {
      selectedImages.value = val ? [val] : [];
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  (val) => {
    if (val) loadImages();
  },
);

const loadImages = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: page.value,
      limit: pageSize.value,
      LIKE_filename: searchKeyword.value,
    };
    const res = await requestClient.get('/file/list', { params });
    imageList.value = res?.items || res?.list || [];
    total.value = res?.total || 0;
  } catch {
    ElMessage.error($t('components.form.image_picker.load_error'));
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  loadImages();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  loadImages();
};

const handleCurrentChange = (current: number) => {
  page.value = current;
  loadImages();
};

const getImageUrl = (image: any) => {
  if (!image.base_path) return '';
  return buildStaticUrl(image.base_path);
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
};

const isSelected = (image: any) => {
  return selectedImages.value.some(
    (item) => item.id === image.id || item.base_path === image.base_path,
  );
};

const toggleSelect = (image: any) => {
  if (props.multiple) {
    const index = selectedImages.value.findIndex(
      (item) => item.id === image.id,
    );
    if (index === -1) {
      selectedImages.value.push(image);
    } else {
      selectedImages.value.splice(index, 1);
    }
  } else {
    selectedImages.value = [image];
  }
};

const customUpload = async (e: any) => {
  try {
    const formData = new FormData();
    formData.append('file', e.file);
    await requestClient.post('/file/upload', formData);
    ElMessage.success($t('components.form.image_picker.upload_success'));
    loadImages();
  } catch {
    ElMessage.error($t('components.form.image_picker.upload_error'));
  }
};

const handleClose = () => {
  dialogVisible.value = false;
  selectedImages.value = [];
};

const handleConfirm = () => {
  if (props.multiple) {
    const result = selectedImages.value.map((img) => img.base_path);
    emit('confirm', result);
  } else {
    const result = selectedImages.value[0]?.base_path || '';
    emit('confirm', result);
  }
  handleClose();
};
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    :title="$t('components.form.image_picker.title')"
    width="50%"
    top="10vh"
    draggable
    class="image-selector-dialog"
    destroy-on-close
    @close="handleClose"
  >
    <div class="image-selector-content">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-2 flex-1 mr-4">
          <ElInput
            v-model="searchKeyword"
            :placeholder="$t('components.form.image_picker.search_placeholder')"
            class="flex-1"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="lucide:search" class="text-sm" />
            </template>
          </ElInput>
          <ElButton type="primary" @click="handleSearch">
            {{ $t('search') }}
          </ElButton>
        </div>

        <ElUpload
          :http-request="customUpload"
          :show-file-list="false"
          accept="image/*"
        >
          <ElButton type="primary">
            <Icon icon="lucide:upload" class="mr-1" />
            {{ $t('components.form.image_picker.upload') }}
          </ElButton>
        </ElUpload>
      </div>

      <div v-loading="loading" class="image-grid">
        <div
          v-for="image in imageList"
          :key="image.id"
          class="image-item"
          :class="{ 'is-selected': isSelected(image) }"
          @click="toggleSelect(image)"
        >
          <img :src="getImageUrl(image)" class="image-preview" />
          <div class="image-name">{{ image.filename }}</div>
          <div class="image-size">{{ formatFileSize(image.file_size) }}</div>

          <div v-if="isSelected(image)" class="selected-indicator">
            <Icon icon="lucide:check" class="text-white text-lg" />
          </div>
        </div>

        <div v-if="!loading && imageList.length === 0" class="empty-state">
          <Icon icon="lucide:image-off" class="text-4xl" />
          <div>{{ $t('components.form.image_picker.empty') }}</div>
        </div>
      </div>

      <div class="flex justify-center mt-4">
        <ElPagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">
          {{ $t('cancel') }}
        </ElButton>
        <ElButton
          type="primary"
          @click="handleConfirm"
          :disabled="selectedImages.length === 0"
        >
          {{ $t('confirm') }} ({{ selectedImages.length }})
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.image-selector-content {
  min-height: 400px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  min-height: 300px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.3s;
}

.image-item:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  transform: translateY(-4px);
}

.image-item.is-selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgb(var(--el-color-primary-rgb), 0.2);
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-name {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 4px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: white;
  white-space: nowrap;
  background: linear-gradient(to top, rgb(0 0 0 / 70%), transparent);
}

.image-size {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  font-size: 10px;
  color: white;
  background: rgb(0 0 0 / 60%);
  border-radius: 4px;
}

.selected-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--el-color-primary);
  border: 2px solid white;
  border-radius: 50%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  grid-column: 1 / -1;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--el-text-color-secondary);
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
