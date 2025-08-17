<script setup lang="ts">
  import { ElImage as Image } from 'element-plus'

  defineProps({
    value: {
      type: String,
      default: ''
    }
  })
</script>
<template>
  <Image v-if="value" :preview-src-list="[value]" :src="value" style="width: 102px" />
</template>
<style lang="scss" scoped></style>
