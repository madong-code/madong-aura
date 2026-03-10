<script setup lang="ts">
  import { useVModel } from '@vueuse/core'
  import { ElUpload as Upload } from 'element-plus'

  import { FilesService } from '@/api/tools/files'
  import { Icon } from '@/components/icon'
  import { buildStaticUrl, extractRelativePath } from '@/utils/url/static-resource'

  defineOptions({
    inheritAttrs: false
  })

  const props = defineProps({
    value: {
      type: String,
      default: ''
    },
    // 是否自动添加/移除公共路径前缀
    autoHandleBaseUrl: {
      type: Boolean,
      default: true
    }
  })

  const emits = defineEmits(['update:value'])
  const mValue = useVModel(props, 'value', emits, {
    defaultValue: props.value,
    passive: true
  })

  // 处理显示URL（确保回显时带公共路径）
  const displayUrl = computed(() => {
    return props.autoHandleBaseUrl && mValue.value ? buildStaticUrl(mValue.value) : mValue.value
  })

  // 处理存储URL（确保存储时无公共路径）
  const getStorableUrl = (url: string) => {
    return props.autoHandleBaseUrl ? extractRelativePath(url) : url
  }

  const customRequest = async (e: any) => {
    try {
      const data = await FilesService.uploadFile({
        file: e.file
      })
      const processedUrl = getStorableUrl(data.base_path || '')
      mValue.value = processedUrl
      emits('update:value', processedUrl)
    } catch (error) {
      console.error('Upload failed:', error)
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
    list-type="picture-card"
  >
    <div v-if="displayUrl" class="m-avatar-wrap">
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
    .m-avatar-icon-delete {
      position: absolute;
      top: 0;
      right: 0;
      cursor: pointer;
    }
  }
  .m-upload {
    :deep(.el-upload--picture-card) {
      width: 102px;
      height: 102px;
    }
  }
</style>
