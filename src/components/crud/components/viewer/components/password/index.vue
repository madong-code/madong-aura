<script setup lang="ts">
defineProps<{
  data?: Record<string, any>;
  fieldName?: string;
  schema?: any;
  value?: null | string;
}>();
</script>

<template>
  <span class="reader-password">{{ value ? '******' : '--' }}</span>
</template>
