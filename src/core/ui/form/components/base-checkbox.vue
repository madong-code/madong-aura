<script setup lang="ts">
defineOptions({ name: 'VbenBaseCheckbox' });

defineProps<{
  checked?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:checked': [value: boolean];
}>();
</script>

<template>
  <ElCheckbox
    :model-value="checked"
    :disabled="disabled"
    @update:model-value="emit('update:checked', $event as boolean)"
  >
    <slot />
  </ElCheckbox>
</template>
