<template>
  <MyDivider :title="title" />
</template>
<script lang="ts" setup>
  import MyDivider from '@/components/form/components/divider.vue'
  defineOptions({
    inheritAttrs: false
  })
  defineProps({
    title: {
      type: String,
      default: ''
    }
  })
</script>
