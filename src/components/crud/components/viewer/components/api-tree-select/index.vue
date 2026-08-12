<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  code?: string;
  data?: Record<string, any>;
  fieldName?: string;
  labelField?: string;
  schema?: any;
  value?: (number | string)[] | null | number | string;
  valueField?: string;
}>();

const options = ref<any[]>([]);
const labelField = computed(() => props.labelField || 'label');
const valueField = computed(() => props.valueField || 'value');

const flattenTree = (nodes: any[]): any[] => {
  const result: any[] = [];
  for (const n of nodes) {
    result.push(n);
    if (n.children?.length) result.push(...flattenTree(n.children));
  }
  return result;
};

const displayValue = computed(() => {
  if (
    options.value.length === 0 ||
    props.value === null ||
    props.value === undefined
  )
    return null;
  const flat = flattenTree(options.value);
  const vals = Array.isArray(props.value) ? props.value : [props.value];
  const names = vals.map((v) => {
    const opt = flat.find(
      (o: any) => String(o[valueField.value]) === String(v),
    );
    return opt ? opt[labelField.value] : v;
  });
  return names.join(', ');
});

const fetchData = async () => {
  if (!props.code) return;
  try {
    const { useDictStore } = await import('#/store/modules/dict');
    const store = useDictStore();
    const list = await store.getDictByType(props.code);
    options.value = Array.isArray(list) ? list : [];
  } catch {
    options.value = [];
  }
};

watch(() => props.code, fetchData);
onMounted(fetchData);
</script>

<template>
  <span class="reader-api-tree-select">{{
    displayValue ?? value ?? '--'
  }}</span>
</template>
