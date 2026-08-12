<script setup lang="ts">
defineProps<{
  data?: Record<string, any>;
  fieldName?: string;
  schema?: any;
  value?: null | number;
}>();
</script>

<template>
  <span class="reader-input-number">{{ value ?? '--' }}</span>
</template>
