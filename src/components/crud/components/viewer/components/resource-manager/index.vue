<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data?: Record<string, any>;
  fieldName?: string;
  schema?: any;
  value?: null | string | string[];
}>();

const displayValue = computed(() => {
  if (!props.value) return null;
  if (Array.isArray(props.value)) return props.value.join(', ');
  return props.value;
});
</script>

<template>
  <span class="reader-resource">{{ displayValue ?? '--' }}</span>
</template>
