<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    data?: Record<string, any>;
    fieldName?: string;
    schema?: any;
    value?: null | Record<string, any>;
  }>(),
  { value: () => ({}) },
);

const entries = computed(() => {
  if (!props.value || typeof props.value !== 'object') return [];
  return Object.entries(props.value).map(([key, val]) => ({
    key,
    val: typeof val === 'object' ? JSON.stringify(val) : String(val),
  }));
});
</script>

<template>
  <div class="reader-kv">
    <template v-if="entries.length > 0">
      <div class="kv-header">
        <span class="kv-header-key">{{ $t('ui.form.key', '键') }}</span>
        <span class="kv-header-sep"></span>
        <span class="kv-header-val">{{ $t('ui.form.value', '值') }}</span>
      </div>
      <div
        v-for="(e, i) in entries"
        :key="i"
        class="kv-row"
        :class="{ 'kv-row-striped': i % 2 === 0 }"
      >
        <span class="kv-cell-key">{{ e.key }}</span>
        <span class="kv-sep">:</span>
        <span class="kv-cell-val">{{ e.val }}</span>
      </div>
    </template>
    <span v-else class="empty-value">--</span>
  </div>
</template>

<style lang="scss" scoped>
.reader-kv {
  width: 100%;
  overflow: hidden;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) / 3 + 2px);
}

.kv-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  background-color: hsl(var(--muted) / 50%);
  border-bottom: 1px solid hsl(var(--border));
}

.kv-header-key {
  flex: 0 0 35%;
}

.kv-header-sep {
  flex-shrink: 0;
  width: 8px;
}

.kv-header-val {
  flex: 1;
}

.kv-row {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 32px;
  padding: 4px 12px;
  font-size: 13px;
  color: hsl(var(--foreground));
  border-bottom: 1px solid hsl(var(--border));
}

.kv-row:last-child {
  border-bottom: none;
}

.kv-row-striped {
  background-color: hsl(var(--muted) / 25%);
}

.kv-cell-key {
  flex: 0 0 35%;
  word-break: break-all;
}

.kv-sep {
  flex-shrink: 0;
  width: 8px;
  color: hsl(var(--muted-foreground));
  text-align: center;
  user-select: none;
}

.kv-cell-val {
  flex: 1;
  word-break: break-all;
}

.empty-value {
  font-style: italic;
  color: hsl(var(--muted-foreground));
}
</style>
