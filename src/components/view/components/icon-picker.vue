<template>
  <Icon :icon="value" />
</template>
<script setup lang="ts">
  import { Icon } from '@/components/icon'
  defineOptions({
    inheritAttrs: false
  })
  defineProps({
    value: {
      type: String
    },
    record: {
      // 当前行数据
      type: Object
    }
  })
</script>

<style lang="scss" scoped></style>
