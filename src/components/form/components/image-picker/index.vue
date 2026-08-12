<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useVModel } from '@vueuse/core';
import { ElMessage } from 'element-plus';

import { $t } from '#/locales';

import ImageSelectorDialog from './image-picker-dialog.vue';

interface Props {
  modelValue?: null | string | string[];
  multiple?: boolean;
  disabled?: boolean;
  shape?: 'circle' | 'square';
  size?: 'large' | 'medium' | 'small';
  accept?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  multiple: false,
  disabled: false,
  shape: 'square',
  size: 'medium',
  accept: 'image/*',
});

const emit = defineEmits<{
  change: [modelValue: null | string | string[]];
  confirm: [modelValue: string | string[]];
  'update:modelValue': [modelValue: null | string | string[]];
}>();

const dialogVisible = ref(false);

const mValue = useVModel(props, 'modelValue', emit, {
  defaultValue: props.modelValue,
  passive: true,
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(mValue.value)) {
      mValue.value = newValue;
    }
  },
);

const displayImages = computed<string[]>(() => {
  if (!mValue.value) return [];
  const values = Array.isArray(mValue.value) ? mValue.value : [mValue.value];
  return values.filter(Boolean) as string[];
});

const defaultSelected = computed<string | string[]>(() => {
  return (mValue.value as string | string[]) || (props.multiple ? [] : '');
});

const openSelector = () => {
  if (props.disabled) return;
  dialogVisible.value = true;
};

const handleConfirm = (selected: string | string[]) => {
  mValue.value = selected as any;
  emit('change', selected as string | string[]);
  emit('confirm', selected as string | string[]);
  ElMessage.success($t('components.form.image_picker.select_success'));
};

const removeImage = (index: number) => {
  if (props.disabled) return;
  if (props.multiple && Array.isArray(mValue.value)) {
    const newValue = [...mValue.value];
    newValue.splice(index, 1);
    mValue.value = newValue as any;
  } else {
    mValue.value = null;
  }
  emit('change', mValue.value as null | string | string[]);
};
</script>

<template>
  <div class="image-selector">
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
        <div
          v-else
          class="preview-image default-image flex items-center justify-center text-gray-400"
        >
          <Icon icon="lucide:image-plus" :size="32" />
        </div>

        <div v-if="!disabled" class="image-overlay">
          <Icon icon="lucide:pencil" class="text-white text-2xl" />
          <div class="overlay-text">
            {{ $t('components.form.image_picker.select') }}
          </div>
        </div>

        <div
          v-if="!disabled && displayImages.length > 0"
          class="remove-btn"
          @click.stop="removeImage(0)"
        >
          <Icon icon="lucide:trash-2" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="image-grid-wrapper">
        <div
          v-for="(image, index) in displayImages"
          :key="index"
          class="image-preview-wrapper is-square"
          :class="`is-${size}`"
        >
          <img :src="image" class="preview-image" />
          <div
            v-if="!disabled"
            class="remove-btn"
            @click.stop="removeImage(index)"
          >
            <Icon icon="lucide:trash-2" />
          </div>
        </div>

        <div
          v-if="!disabled"
          class="image-preview-wrapper is-square add-btn"
          :class="`is-${size}`"
          @click="openSelector"
        >
          <Icon icon="lucide:plus" class="text-2xl" />
          <div class="add-text">
            {{ $t('components.form.image_picker.select') }}
          </div>
        </div>
      </div>
    </template>

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
  overflow: hidden;
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 2px dashed var(--el-border-color);
  transition: all 0.3s;
}

.image-preview-wrapper:hover:not(.add-btn) {
  border-color: var(--el-color-primary);

  .image-overlay {
    opacity: 1;
  }

  .remove-btn {
    display: flex;
  }
}

.image-preview-wrapper.is-circle {
  border-radius: 50%;
}

.image-preview-wrapper.is-square {
  border-radius: 8px;
}

.image-preview-wrapper.is-small {
  width: 80px;
  height: 80px;
}

.image-preview-wrapper.is-medium {
  width: 120px;
  height: 120px;
}

.image-preview-wrapper.is-large {
  width: 160px;
  height: 160px;
}

.image-preview-wrapper.add-btn {
  flex-direction: column;
  gap: 4px;
  border-style: dashed;
}

.image-preview-wrapper.add-btn:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-image.default-image {
  opacity: 0.5;
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  background: rgb(0 0 0 / 60%);
  opacity: 0;
  transition: opacity 0.3s;
}

.overlay-text {
  margin-top: 4px;
  font-size: 12px;
}

.remove-btn {
  position: absolute;
  bottom: 8px;
  left: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  transform: translateX(-50%);
  transition: all 0.3s;
}

.remove-btn .el-icon {
  font-size: 14px;
  color: var(--el-color-danger);
}

.image-preview-wrapper:hover .remove-btn {
  display: flex;
}

.add-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.image-grid-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
