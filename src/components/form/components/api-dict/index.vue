<script setup lang="ts">
import { computed, onBeforeMount, ref, useAttrs } from 'vue';

import CheckboxGroup from '../checkbox-group/index.vue';
import RadioGroup from '../radio-group/index.vue';
import Select from '../select/index.vue';

interface DictOption {
  label: string;
  modelValue: number | string;
}

const props = withDefaults(
  defineProps<{
    code: string;
    modelValue?: Array<number | string> | number | string;
    renderType?: 'CheckboxGroup' | 'RadioGroup' | 'Select';
  }>(),
  {
    modelValue: '',
    renderType: 'Select',
  },
);

const emit = defineEmits<{
  'update:modelValue': [modelValue: any];
}>();

const attrs = useAttrs();

const componentMap: Record<string, any> = {
  Select,
  RadioGroup,
  CheckboxGroup,
};

const CurrentComponent = computed(
  () => componentMap[props.renderType || 'Select'],
);

const emitValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const options = ref<DictOption[]>([]);

onBeforeMount(async () => {
  if (!props.code) {
    console.warn('ApiDict: code prop is required');
    options.value = [];
    return;
  }
  try {
    const dictModule = await import('#/store/modules/dict');
    const dictStore = dictModule.useDictStore();
    const data = await dictStore.getDictByType(props.code);
    options.value = Array.isArray(data)
      ? data.map((item) => ({
          ...item,
          modelValue: item.value,
        }))
      : [];
  } catch (error) {
    console.error('获取字典数据失败:', error);
    options.value = [];
  }
});
</script>

<template>
  <component
    :is="CurrentComponent"
    v-model="emitValue"
    :options="options"
    v-bind="attrs"
  />
</template>
