<script setup lang="ts">
defineOptions({ name: 'VbenBaseSelect' });

defineProps<{
  clearable?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  modelValue?: any;
  options?: {
    disabled?: boolean;
    label: string;
    value: any;
  }[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  change: [value: any];
  'update:modelValue': [value: any];
}>();
</script>

<template>
  <ElSelect
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :multiple="multiple"
    class="w-full"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event)"
  >
    <ElOption
      v-for="opt in options || []"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
      :disabled="opt.disabled"
    />
    <slot />
  </ElSelect>
</template>
