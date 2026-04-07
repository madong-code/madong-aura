<script setup lang="ts">
import { computed, useAttrs, watch } from 'vue'
import { useVModel } from '@vueuse/core'
import { ElUpload as Upload, ElMessage } from 'element-plus'

import { FilesService } from '@/api/tools/files'
import { Icon } from '@/components/icon'
import { buildStaticUrl, extractRelativePath } from '@/utils/url/static-resource'

defineOptions({
  inheritAttrs: false
})

interface Props {
  value?: string
  autoHandleBaseUrl?: boolean
  shape?: 'circle' | 'square'
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  autoHandleBaseUrl: true,
  shape: 'square'
})

const emits = defineEmits<{
  'update:value': [value: string]
  success: [url: string]
}>()

const attrs = useAttrs()

const mValue = useVModel(props, 'value', emits, {
  defaultValue: props.value,
  passive: true
})

// 监听 value 变化，确保外部更新时能正确响应
watch(() => props.value, (newValue) => {
  console.log('Avatar value changed:', newValue)
  if (newValue !== mValue.value) {
    mValue.value = newValue
  }
})

// 处理显示URL（确保回显时带公共路径）
const displayUrl = computed(() => {
  if (!props.autoHandleBaseUrl || !mValue.value) return mValue.value
  
  const url = buildStaticUrl(mValue.value)
  console.log('Avatar display URL:', { input: mValue.value, output: url })
  return url
})

// 处理存储URL（确保存储时无公共路径）
const getStorableUrl = (url: string) => {
  if (!props.autoHandleBaseUrl) return url
  
  const relativePath = extractRelativePath(url)
  // 确保路径以 / 开头（如果存在）
  return relativePath && !relativePath.startsWith('/') ? `/${relativePath}` : relativePath
}

const customRequest = async (e: any) => {
  try {
    const data = await FilesService.uploadFile({
      file: e.file
    })
    const processedUrl = getStorableUrl(data.base_path || '')
    mValue.value = processedUrl
    emits('update:value', processedUrl)
    emits('success', processedUrl)
  } catch (error) {
    console.error('Upload failed:', error)
    ElMessage.error('头像上传失败')
  }
}

const handleRemove = (e: Event) => {
  e.stopPropagation()
  mValue.value = ''
  emits('update:value', '')
}
</script>

<template>
  <Upload
    :http-request="customRequest"
    :show-file-list="false"
    class="m-upload"
    :class="`is-${shape}`"
    list-type="picture-card"
    v-bind="attrs"
  >
    <div v-if="displayUrl" class="m-avatar-wrap" :class="`is-${shape}`">
      <Icon class="m-avatar-icon-delete" icon="ant-design:delete-outlined" @click="handleRemove" />
      <img :src="displayUrl" width="100%" />
    </div>
    <Icon v-else icon="ant-design:plus-outlined" />
  </Upload>
</template>

<style lang="scss" scoped>
.m-avatar-wrap {
  position: relative;
  height: 102px;
  overflow: hidden;

  // 圆形
  &.is-circle {
    border-radius: 50%;
  }

  // 方形
  &.is-square {
    border-radius: 8px;
  }

  .m-avatar-icon-delete {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    z-index: 10;
  }

  img {
    height: 100%;
    object-fit: cover;
  }
}

.m-upload {
  :deep(.el-upload--picture-card) {
    width: 102px;
    height: 102px;
  }
  
  // 圆形上传区域
  &.is-circle :deep(.el-upload--picture-card) {
    border-radius: 50%;
  }

  // 方形上传区域
  &.is-square :deep(.el-upload--picture-card) {
    border-radius: 8px;
  }
}
</style>
