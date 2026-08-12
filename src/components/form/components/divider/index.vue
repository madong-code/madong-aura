<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: '',
  },
);
</script>

<template>
  <div class="divider">
    <span class="title">{{ title }}</span>
  </div>
</template>

<style scoped>
.divider {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.divider .title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}
</style>
