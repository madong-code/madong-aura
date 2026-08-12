<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    data?: Record<string, any>;
    fieldName?: string;
    rowKey?: string;
    schema?: any;
    value?: null | string | string[];
  }>(),
  {
    rowKey: 'id',
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

const fetchList = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const { RoleService } = await import('#/api/system/role');
    const res: any = await RoleService.list();
    const list = Array.isArray(res) ? res : res?.items || res?.list || [];
    const map = new Map<string, string>();
    list.forEach((r: any) => map.set(String(r[props.rowKey]), r.name));
    nameMap.value = map;
  } catch {
    nameMap.value = new Map();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchList();
});
</script>

<template>
  <span class="reader-api-select-role">
    <template v-if="loading">
      <span class="loading-text">加载中...</span>
    </template>
    <template v-else>{{ displayValue }}</template>
  </span>
</template>

<style lang="scss" scoped>
.reader-api-select-role {
  .loading-text {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
