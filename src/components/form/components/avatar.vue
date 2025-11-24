<script setup lang="ts">
  import { useVModel } from '@vueuse/core'
  import { ElUpload as Upload } from 'element-plus'

  import { FileInfoService } from '@/api/sys/file-info'
  import { Icon } from '@/components/icon'

  defineOptions({
    inheritAttrs: false
  })
  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    }
  })
  const emits = defineEmits(['update:modelValue'])
  const mValue = useVModel(props, 'modelValue', emits, {
    defaultValue: props.modelValue,
    passive: true
  })
  const customRequest = (e: any) => {
    return new Promise((resolve, reject) => {
      FileInfoService.uploadFile({
        file: e.file
      })
        .then((data: any) => {
          mValue.value = data.fullUrl
          resolve(data)
        })
        .catch(reject)
    })
  }
  const handleRemove = (e: Event) => {
    e.stopPropagation()
    mValue.value = ''
  }
</script>
<template>
  <Upload
    :http-request="customRequest"
    :show-file-list="false"
    class="m-upload"
    list-type="picture-card"
  >
    <div v-if="mValue" class="m-avatar-wrap">
      <Icon class="m-avatar-icon-delete" icon="ant-design:delete-outlined" @click="handleRemove" />
      <img :src="mValue" width="100%" />
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
