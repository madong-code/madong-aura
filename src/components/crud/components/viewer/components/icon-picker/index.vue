<script setup lang="ts">
import { Icon } from '#/components/icon';

defineProps<{
  data?: Record<string, any>;
  fieldName?: string;
  schema?: any;
  value?: null | string;
}>();
</script>

<template>
  <span class="reader-icon-picker">
    <Icon v-if="value" :icon="value" />
    <span v-else class="empty-value">--</span>
  </span>
</template>

<style lang="scss" scoped>
.empty-value {
  color: var(--el-text-color-placeholder, #94a3b8);
}
</style>
