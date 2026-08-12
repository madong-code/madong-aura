<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  code?: string;
  data?: Record<string, any>;
  fieldName?: string;
  labelField?: string;
  schema?: any;
  value?: (number | string)[] | null;
  valueField?: string;
}>();

const options = ref<any[]>([]);
const labelField = computed(() => props.labelField || 'label');
const valueField = computed(() => props.valueField || 'value');

const displayValue = computed(() => {
  if (options.value.length === 0 || !props.value?.length) return null;
  return props.value
    .map((v) => {
      const opt = options.value.find(
        (o: any) => String(o[valueField.value]) === String(v),
      );
      return opt ? opt[labelField.value] : v;
    })
    .join(', ');
});

const fetchDict = async () => {
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

watch(() => props.code, fetchDict);
onMounted(fetchDict);
</script>

<template>
  <span class="reader-api-checkbox-group">{{ displayValue ?? '--' }}</span>
</template>
