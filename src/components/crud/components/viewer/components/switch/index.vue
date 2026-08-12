<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    activeText?: string;
    data?: Record<string, any>;
    fieldName?: string;
    inactiveText?: string;
    schema?: any;
    value?: boolean | null | number | string | undefined;
  }>(),
  {
    activeText: '是',
    inactiveText: '否',
  },
);

const isActive = computed(() => {
  if (typeof props.value === 'boolean') return props.value;
  return !!props.value && String(props.value) !== '0';
});
</script>

<template>
  <span class="reader-switch">
    <span class="switch-dot" :class="[{ active: isActive }]">
      <span class="switch-inner">{{
        isActive ? activeText : inactiveText
      }}</span>
    </span>
  </span>
</template>

<style lang="scss" scoped>
.reader-switch {
  display: inline-flex;
  align-items: center;
}

.switch-dot {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary, #64748b);
  background-color: var(--el-fill-color, #e2e8f0);
  border-radius: 12px;
  transition: all 0.3s ease;

  &.active {
    color: #fff;
    background-color: #10b981;
  }
}

.switch-inner {
  line-height: 16px;
}
</style>
