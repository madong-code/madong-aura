<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    code?: string;
    data?: Record<string, any>;
    fieldName?: string;
    labelField?: string;
    multiple?: boolean;
    options?: {
      label: string;
      value: number | string;
    }[];
    schema?: any;
    value?: (number | string)[] | null | number | string | undefined;
    valueField?: string;
  }>(),
  {
    multiple: false,
    labelField: 'label',
    valueField: 'value',
  },
);

const treeOptions = ref<{ label: string; value: number | string }[]>([]);

const displayLabel = computed(() => {
  const allOptions = props.options || treeOptions.value;

  if (!allOptions || allOptions.length === 0) {
    return props.value;
  }
  if (props.value === undefined || props.value === null) {
    return undefined;
  }
  if (Array.isArray(props.value)) {
    const labels = props.value.map((val) => {
      const option = allOptions.find((opt) => opt.value === val);
      return option ? option.label : val;
    });
    return labels.join(', ');
  }
  const option = allOptions.find((opt) => opt.value === props.value);
  return option ? option.label : props.value;
});

const fetchTreeOptions = async () => {
  if (!props.code) return;

  try {
    const dictStore = await import('#/store/modules/dict').then((m) =>
      m.useDictStore(),
    );
    const dict = await dictStore.getDictByType(props.code);
    treeOptions.value = dict.map((item: any) => ({
      label: item[props.labelField],
      value: item[props.valueField],
    }));
  } catch {
    treeOptions.value = [];
  }
};

watch(() => props.code, fetchTreeOptions);
watch(
  () => props.value,
  () => {},
);

onMounted(fetchTreeOptions);
</script>

<template>
  <span class="reader-select">
    <template v-if="displayLabel !== undefined">
      {{ displayLabel }}
    </template>
    <span v-else class="empty-value">--</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-select {
  .empty-value {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
