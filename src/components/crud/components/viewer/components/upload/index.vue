<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    data?: Record<string, any>;
    fieldName?: string;
    schema?: any;
    value?: null | string | undefined | { name: string; url: string }[];
  }>(),
  {},
);

const files = computed(() => {
  if (!props.value) return [];

  if (Array.isArray(props.value)) {
    return props.value;
  }

  if (typeof props.value === 'string') {
    try {
      const parsed = JSON.parse(props.value);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          url: item.url || item,
          name: item.name || '',
        }));
      }
    } catch {
      return [{ url: props.value, name: '' }];
    }
  }

  return [];
});

const isImage = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
};
</script>

<template>
  <span class="reader-upload">
    <template v-if="files.length > 0">
      <template v-for="(file, index) in files" :key="index">
        <span class="file-item">
          <span v-if="isImage(file.url)" class="file-preview">
            <img :src="file.url" :alt="file.name" class="preview-img" />
          </span>
          <span v-else class="file-name">{{ file.name }}</span>
        </span>
        <span v-if="index < files.length - 1" class="file-separator">, </span>
      </template>
    </template>
    <span v-else class="empty-value">--</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-upload {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.file-item {
  display: flex;
  align-items: center;
}

.file-preview {
  display: inline-block;
}

.preview-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.file-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-separator {
  margin: 0 4px;
}

.empty-value {
  color: var(--el-text-color-placeholder, #94a3b8);
}
</style>
