<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    code?: string;
    data?: Record<string, any>;
    fieldName?: string;
    labelField?: string;
    schema?: any;
    value?: null | number | string | undefined;
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
  if (loading.value || options.value.length === 0) {
    return undefined;
  }
  if (props.value === undefined || props.value === null) {
    return undefined;
  }
  const option = options.value.find(
    // 后端字段可能为字符串（如 varchar 存的枚举值），字典项为数字，统一按字符串比较
    (opt) => String(opt[props.valueField]) === String(props.value),
  );
  return option ? option[props.labelField] : props.value;
});

const fetchDict = async () => {
  if (!props.code) {
    loading.value = false;
    return;
  }

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
  <span class="reader-api-dict">
    <template v-if="loading">
      <span class="loading-text">加载中...</span>
    </template>
    <template v-else-if="displayValue !== undefined">
      {{ displayValue }}
    </template>
    <span v-else class="empty-value">--</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-api-dict {
  .loading-text {
    color: var(--el-text-color-placeholder, #94a3b8);
  }

  .empty-value {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
