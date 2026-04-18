<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useVModel } from "@vueuse/core";
import { ElMessage, ElIcon } from "element-plus";
import { Edit, Delete, Plus } from "@element-plus/icons-vue";
import { buildStaticUrl, extractRelativePath } from "@/utils/url/static-resource";
import defaultImage from "@/assets/images/avatar/default-avatar.webp";
import ImageSelectorDialog from "./image-picker-dialog.vue";
import { $t } from "@/locales";

interface Props {
  value?: string | string[] | null;
  autoHandleBaseUrl?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  shape?: "circle" | "square";
  size?: "small" | "medium" | "large";
  accept?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  autoHandleBaseUrl: true,
  multiple: false,
  disabled: false,
  shape: "square",
  size: "medium",
  accept: "image/*",
});

const emit = defineEmits<{
  "update:value": [value: string | string[] | null];
  change: [value: string | string[] | null];
  confirm: [value: string | string[]];
}>();

const dialogVisible = ref(false);

// 使用 v-model 进行双向绑定
const mValue = useVModel(props, "value", emit, {
  defaultValue: props.value,
  passive: true,
});

// 监听外部 value 变化
watch(
  () => props.value,
  (newValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(mValue.value)) {
      mValue.value = newValue;
    }
  }
);

// 计算显示的图片URL
const displayImages = computed(() => {
  if (!mValue.value) return [];

  const values = Array.isArray(mValue.value) ? mValue.value : [mValue.value];

  return values.map((url) => {
    if (!props.autoHandleBaseUrl || !url) return url;
    return buildStaticUrl(url);
  });
});

// 获取默认图片
const getDefaultImage = () => {
  return defaultImage;
};

// 打开图片选择器
const openSelector = () => {
  if (props.disabled) return;
  dialogVisible.value = true;
};

// 处理图片选择确认
const handleConfirm = (selected: string | string[]) => {
  mValue.value = selected;
  emit("change", selected);
  emit("confirm", selected);
  ElMessage.success($t("image-picker.selector.select_success"));
};

// 移除图片
const removeImage = (index: number) => {
  if (props.disabled) return;

  if (props.multiple && Array.isArray(mValue.value)) {
    const newValue = [...mValue.value];
    newValue.splice(index, 1);
    mValue.value = newValue;
  } else {
    mValue.value = null;
  }
  emit("change", mValue.value);
};

// 计算组件尺寸
const componentSize = computed(() => {
  const sizeMap = {
    small: "80px",
    medium: "120px",
    large: "160px",
  };
  return sizeMap[props.size];
});

// 计算默认选中值（传递给弹窗）
const defaultSelected = computed(() => {
  return mValue.value || (props.multiple ? [] : "");
});
</script>

<template>
  <div class="image-selector">
    <!-- 单选模式 -->
    <template v-if="!multiple">
      <div
        class="image-preview-wrapper"
        :class="[`is-${shape}`, `is-${size}`]"
        @click="openSelector"
      >
        <img
          v-if="displayImages.length > 0"
          :src="displayImages[0]"
          class="preview-image"
        />
        <img v-else :src="getDefaultImage()" class="preview-image default-image" />

        <!-- 悬停遮罩 -->
        <div v-if="!disabled" class="image-overlay">
          <ElIcon class="text-white text-2xl">
            <Edit />
          </ElIcon>
          <div class="overlay-text">
            {{ $t("image-picker.selector.select") }}
          </div>
        </div>

        <!-- 移除按钮 -->
        <div
          v-if="!disabled && displayImages.length > 0"
          class="remove-btn"
          @click.stop="removeImage(0)"
        >
          <ElIcon>
            <Delete />
          </ElIcon>
        </div>
      </div>
    </template>

    <!-- 多选模式 -->
    <template v-else>
      <div class="image-grid-wrapper">
        <div
          v-for="(image, index) in displayImages"
          :key="index"
          class="image-preview-wrapper is-square"
          :class="`is-${size}`"
        >
          <img :src="image" class="preview-image" />
          <div v-if="!disabled" class="remove-btn" @click.stop="removeImage(index)">
            <ElIcon class="text-white">
              <Delete />
            </ElIcon>
          </div>
        </div>

        <!-- 添加按钮 -->
        <div
          v-if="!disabled"
          class="image-preview-wrapper is-square add-btn"
          :class="`is-${size}`"
          @click="openSelector"
        >
          <ElIcon class="text-g-500 text-2xl">
            <Plus />
          </ElIcon>
          <div class="add-text">
            {{ $t("image-picker.selector.select") }}
          </div>
        </div>
      </div>
    </template>

    <!-- 图片选择弹窗 -->
    <ImageSelectorDialog
      v-model="dialogVisible"
      :multiple="multiple"
      :default-selected="defaultSelected"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>
.image-selector {
  display: inline-block;
}

.image-preview-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--art-gray-100);
  border: 2px dashed var(--art-gray-300);
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;

  &:hover:not(.add-btn) {
    border-color: var(--el-color-primary);

    .image-overlay {
      opacity: 1;
    }

    .remove-btn {
      display: flex;
    }
  }

  // 形状
  &.is-circle {
    border-radius: 50%;
  }

  &.is-square {
    border-radius: 8px;
  }

  // 尺寸
  &.is-small {
    width: 80px;
    height: 80px;
  }

  &.is-medium {
    width: 120px;
    height: 120px;
  }

  &.is-large {
    width: 160px;
    height: 160px;
  }

  &.add-btn {
    border-style: dashed;
    flex-direction: column;
    gap: 4px;

    &:hover {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;

  &.default-image {
    opacity: 0.5;
    filter: grayscale(50%);
  }
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
}

.overlay-text {
  font-size: 12px;
  margin-top: 4px;
}

.remove-btn {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  .el-icon {
    font-size: 14px;
    color: var(--el-color-danger);
  }

  &:hover {
    transform: translateX(-50%) scale(1.1);
  }
}

// 悬停时显示删除按钮
.image-preview-wrapper:hover .remove-btn {
  display: flex;
}

.add-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

// 多选网格
.image-grid-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
