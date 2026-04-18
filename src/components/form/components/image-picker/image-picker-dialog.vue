<!-- 图片选择弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="$t('image-picker.selector.title')"
    width="50%"
    top="10vh"
    draggable
    class="image-selector-dialog"
    destroy-on-close
    @close="handleClose"
  >
    <div class="image-selector-content">
      <!-- 头部工具栏 -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-2 flex-1 mr-4">
          <ElInput
            v-model="searchKeyword"
            :placeholder="$t('image-picker.selector.search_placeholder')"
            class="flex-1"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" class="text-sm text-g-500" />
            </template>
          </ElInput>
          <ElButton type="primary" @click="handleSearch">
            {{ $t("common.search") }}
          </ElButton>
        </div>

        <ElUpload :http-request="customUpload" :show-file-list="false" accept="image/*">
          <ElButton type="primary">
            <ArtSvgIcon icon="ant-design:upload-outlined" class="mr-1" />
            {{ $t("image-picker.selector.upload") }}
          </ElButton>
        </ElUpload>
      </div>

      <!-- 图片网格 -->
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

          <!-- 选中状态 -->
          <div v-if="isSelected(image)" class="selected-indicator">
            <ElIcon class="text-white text-lg">
              <Check />
            </ElIcon>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && imageList.length === 0" class="empty-state">
          <ArtSvgIcon icon="ri:image-line" class="text-4xl text-g-400 mb-2" />
          <div class="text-g-500">
            {{ $t("image-picker.selector.empty") }}
          </div>
        </div>
      </div>

      <!-- 分页 -->
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
          {{ $t("common.cancel") }}
        </ElButton>
        <ElButton
          type="primary"
          @click="handleConfirm"
          :disabled="selectedImages.length === 0"
        >
          {{ $t("common.confirm") }} ({{ selectedImages.length }})
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { FilesService } from "@/api/tools/files";
import { buildStaticUrl } from "@/utils/url/static-resource";
import { ElMessage } from "element-plus";
import { Check } from "@element-plus/icons-vue";
import { $t } from "@/locales";
import { f } from "vue-router/dist/router-CWoNjPRp.mjs";

interface Props {
  modelValue: boolean;
  multiple?: boolean;
  defaultSelected?: string | string[] | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  multiple: false,
  defaultSelected: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [images: string | string[]];
}>();

// 状态
const loading = ref(false);
const searchKeyword = ref("");
const page = ref(1);
const pageSize = ref(12);
const total = ref(0);
const imageList = ref<any[]>([]);
const selectedImages = ref<any[]>([]);

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 监听默认值
watch(
  () => props.defaultSelected,
  (val) => {
    if (!val) {
      selectedImages.value = [];
    } else if (props.multiple) {
      // 多选模式，默认值是数组
      selectedImages.value = Array.isArray(val) ? val : [val];
    } else {
      // 单选模式，默认值是字符串
      selectedImages.value = val ? [val] : [];
    }
  },
  { immediate: true }
);

// 监听对话框打开
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      loadImages();
    }
  }
);

// 加载图片列表
const loadImages = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      limit: pageSize.value,
      LIKE_filename: searchKeyword.value,
    };
    const res = await FilesService.getFileList(params);
    imageList.value = res.items || [];
    total.value = res.total || 0;
  } catch (error) {
    ElMessage.error($t("image-picker.selector.load_error"));
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  loadImages();
};

// 分页
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  loadImages();
};

const handleCurrentChange = (current: number) => {
  page.value = current;
  loadImages();
};

// 获取图片URL
const getImageUrl = (image: any) => {
  if (!image.base_path) return "";
  return buildStaticUrl(image.base_path);
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// 是否选中
const isSelected = (image: any) => {
  return selectedImages.value.some(
    (item) => item.id === image.id || item.base_path === image.base_path
  );
};

// 切换选中状态
const toggleSelect = (image: any) => {
  if (props.multiple) {
    // 多选模式
    const index = selectedImages.value.findIndex((item) => item.id === image.id);
    if (index > -1) {
      selectedImages.value.splice(index, 1);
    } else {
      selectedImages.value.push(image);
    }
  } else {
    // 单选模式
    selectedImages.value = [image];
  }
};

// 自定义上传
const customUpload = async (e: any) => {
  try {
    const data = await FilesService.uploadFile({ file: e.file });
    ElMessage.success($t("image-picker.selector.upload_success"));
    // 重新加载列表
    loadImages();
  } catch (error) {
    ElMessage.error($t("image-picker.selector.upload_error"));
  }
};

// 关闭
const handleClose = () => {
  dialogVisible.value = false;
  selectedImages.value = [];
};

// 确认选择
const handleConfirm = () => {
  if (props.multiple) {
    // 多选返回 base_path 数组
    const result = selectedImages.value.map((img) => img.base_path);
    emit("confirm", result);
  } else {
    // 单选返回 base_path 字符串
    const result = selectedImages.value[0]?.base_path || "";
    emit("confirm", result);
  }
  handleClose();
};
</script>

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
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--art-gray-100);
  aspect-ratio: 1;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.is-selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.2);
  }
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.selected-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  background: var(--el-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--el-text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
