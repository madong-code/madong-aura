<script setup lang="ts">
  import type { PropType } from 'vue'

  import Upload from '@/components/form/components/upload.vue'

  defineOptions({
    inheritAttrs: false
  })
  defineProps({
    value: {
      type: String,
      default: ''
    },
    listType: {
      type: String as PropType<'picture' | 'picture-card' | 'text'>,
      default: 'text'
    }
  })
</script>
<template>
  <Upload class="m-upload-disabled" :disabled="true" :list-type="listType" :value="value">
    <template #default></template>
  </Upload>
</template>
<style lang="scss">
  .m-upload-disabled {
    .el-upload {
      display: none !important;
    }
  }
</style>
