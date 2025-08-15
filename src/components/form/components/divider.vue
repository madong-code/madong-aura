<template>
  <div class="divider">
    <span class="title">{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
  // import { useChart } from '@/composables/useChart'

  defineProps<{
    title: string
  }>()
  // 使用基础的 useChart hook
  // const { isDark } = useChart()
</script>

<style lang="scss" scoped>
  .divider {
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    background-color: var(--el-color-primary-light-9);
    color: var(--el-text-color-primary);
    font-size: 14px;
    padding: 0 16px;
    box-sizing: border-box;
    .title {
      color: var(--el-text-color-regular);
      font-size: 15px;
      font-weight: 500;
    }
  }
</style>
