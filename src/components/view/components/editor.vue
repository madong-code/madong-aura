<template>
  <div v-html="value"></div>
</template>
<script setup lang="ts">
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
