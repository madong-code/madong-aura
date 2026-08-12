<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    code?: string;
    data?: Record<string, any>;
    fieldName?: string;
    labelField?: string;
    schema?: any;
    value?: null | number | string;
    valueField?: string;
  }>(),
  {
    labelField: 'label',
    valueField: 'value',
  },
);

const options = ref<any[]>([]);
const loading = ref(false);

const displayValue = computed(() => {
  if (loading.value) return undefined;
  if (
    options.value.length === 0 ||
    props.value === null ||
    props.value === undefined
  )
    return undefined;
  const opt = options.value.find(
    (o: any) => String(o[props.valueField]) === String(props.value),
  );
  return opt ? opt[props.labelField] : undefined;
});

const fetchDict = async () => {
  if (!props.code) return;

  loading.value = true;
  try {
    const dictModule = await import('#/store/modules/dict');
    const dictStore = dictModule.useDictStore();
    const data = await dictStore.getDictByType(props.code);
    options.value = data;
  } catch {
    options.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.code, fetchDict, { immediate: true });
</script>

<template>
  <span class="reader-api-radio-group">
    <template v-if="loading">
      <span class="loading-text">加载中...</span>
    </template>
    <template v-else>{{ displayValue ?? '--' }}</template>
  </span>
</template>

<style lang="scss" scoped>
.reader-api-radio-group {
  .loading-text {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
