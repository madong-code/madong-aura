<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    code?: string;
    data?: Record<string, any>;
    fieldName?: string;
    rowKey?: string;
    schema?: any;
    value?: null | string | string[];
  }>(),
  {
    rowKey: 'id',
    code: '',
    data: () => ({}),
    fieldName: '',
    schema: undefined,
    value: null,
  },
);

const nameMap = ref<Map<string, string>>(new Map());
const loading = ref(false);

const displayValue = computed(() => {
  if (loading.value) return undefined;
  if (
    nameMap.value.size === 0 ||
    props.value === null ||
    props.value === undefined ||
    props.value === ''
  )
    return '--';
  const vals = Array.isArray(props.value)
    ? props.value.map(String)
    : String(props.value).split(',');
  return (
    vals
      .filter(Boolean)
      .map((v) => nameMap.value.get(v) || v)
      .join(', ') || '--'
  );
});

const fetchTree = async () => {
  loading.value = true;
  try {
    const { DeptService } = await import('#/api/system/dept');
    const tree: any[] = await DeptService.getTree();
    const map = new Map<string, string>();
    const walk = (nodes: any[]) => {
      for (const n of nodes) {
        map.set(String(n[props.rowKey]), n.name);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(tree);
    nameMap.value = map;
  } catch {
    nameMap.value = new Map();
  } finally {
    loading.value = false;
  }
};

watch(() => props.value, fetchTree, { immediate: true });
</script>

<template>
  <span class="reader-api-select-dept">
    <template v-if="loading">
      <span class="loading-text">加载中...</span>
    </template>
    <template v-else>
      {{ displayValue }}
    </template>
  </span>
</template>

<style lang="scss" scoped>
.reader-api-select-dept {
  .loading-text {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
