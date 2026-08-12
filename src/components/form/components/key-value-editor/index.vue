<script setup lang="ts">
import { ref, watch } from 'vue';

import { ElButton, ElInput } from 'element-plus';

import { Icon } from '#/components/icon';

interface KeyValueItem {
  key: string;
  val: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: Record<string, any>;
  }>(),
  { modelValue: () => ({}) },
);

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>];
}>();

const objectToList = (obj: Record<string, any> | undefined): KeyValueItem[] => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).map(([key, v]) => ({
    key,
    val: typeof v === 'object' ? JSON.stringify(v) : String(v),
  }));
};

const listToObject = (list: KeyValueItem[]): Record<string, any> => {
  const result: Record<string, any> = {};
  list.forEach((item) => {
    if (item.key.trim()) {
      try {
        result[item.key] = JSON.parse(item.val);
      } catch {
        result[item.key] = item.val;
      }
    }
  });
  return result;
};

const list = ref<KeyValueItem[]>([]);

// 标记最近一次向外 emit 的值，避免 watch 响应自身 emit 导致循环重置
let lastEmittedJson = '';

watch(
  () => props.modelValue,
  (newVal) => {
    const json = JSON.stringify(newVal);
    // 如果是自己刚 emit 出去的值，跳过以免重置 list
    if (json === lastEmittedJson) return;
    list.value = objectToList(newVal);
  },
  { deep: true, immediate: true },
);

const addRow = () => {
  list.value = [...list.value, { key: '', val: '' }];
  handleChange();
};

const removeRow = (index: number) => {
  const newList = [...list.value];
  newList.splice(index, 1);
  list.value = newList;
  handleChange();
};

const handleChange = () => {
  const result = listToObject(list.value);
  lastEmittedJson = JSON.stringify(result);
  emit('update:modelValue', result);
};

defineExpose({
  getValue() {
    return listToObject(list.value);
  },
});
</script>

<template>
  <div class="key-value-editor">
    <!-- 表头 -->
    <div v-if="list.length > 0" class="kv-header">
      <span class="kv-header-key">{{ $t('ui.form.key', '键') }}</span>
      <span class="kv-header-sep"></span>
      <span class="kv-header-val">{{ $t('ui.form.value', '值') }}</span>
      <span class="kv-header-action"></span>
    </div>

    <!-- 数据行 -->
    <div v-for="(item, index) of list" :key="index" class="kv-row">
      <ElInput
        v-model="item.key"
        :placeholder="$t('ui.form.keyPlaceholder', '请输入键')"
        class="kv-input-key"
        @input="handleChange"
      />
      <span class="kv-sep">:</span>
      <ElInput
        v-model="item.val"
        :placeholder="$t('ui.form.valuePlaceholder', '请输入值')"
        class="kv-input-val"
        @input="handleChange"
      />
      <ElButton type="danger" link class="kv-delete" @click="removeRow(index)">
        <Icon icon="lucide:trash-2" />
      </ElButton>
    </div>

    <!-- 添加按钮 -->
    <div class="kv-add">
      <ElButton type="primary" link @click="addRow">
        <Icon icon="lucide:plus" />
        <span>{{ $t('common.addAction', '添加') }}</span>
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.key-value-editor {
  width: 100%;
  overflow: hidden;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) / 3 + 2px);
}

/* 表头 */
.kv-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  background-color: hsl(var(--muted) / 50%);
  border-bottom: 1px solid hsl(var(--border));
}

.kv-header-key {
  flex: 0 0 35%;
}

.kv-header-sep {
  flex-shrink: 0;
  width: 8px;
}

.kv-header-val {
  flex: 1;
}

.kv-header-action {
  flex-shrink: 0;
  width: 32px;
}

/* 数据行 — 斑马纹 */
.kv-row {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 32px;
  padding: 4px 12px;
  font-size: 13px;
  background-color: transparent;
  border-bottom: 1px solid hsl(var(--border));
}

.kv-row:nth-child(odd) {
  background-color: hsl(var(--muted) / 25%);
}

.kv-row:last-child {
  border-bottom: none;
}

/* 输入框隐去边框，融入表格背景 */
.kv-row :deep(.el-input__wrapper) {
  padding: 1px 6px;
  background-color: transparent;
  border-radius: 4px;
  box-shadow: 0 0 0 0 transparent;
  transition:
    box-shadow 0.2s,
    background-color 0.2s;
}

.kv-row :deep(.el-input__wrapper:hover) {
  background-color: hsl(var(--accent) / 40%);
}

.kv-row :deep(.el-input__wrapper.is-focus) {
  background-color: hsl(var(--card));
  box-shadow: 0 0 0 1px hsl(var(--primary)) inset;
}

.kv-row :deep(.el-input__inner) {
  height: 24px;
  font-size: 13px;
  line-height: 24px;
  color: hsl(var(--foreground));
}

.kv-input-key {
  flex: 0 0 35%;
}

.kv-sep {
  flex-shrink: 0;
  width: 8px;
  color: hsl(var(--muted-foreground));
  text-align: center;
  user-select: none;
}

.kv-input-val {
  flex: 1;
}

.kv-delete {
  flex-shrink: 0;
  padding: 4px;
}

/* 添加按钮行 */
.kv-add {
  padding: 6px 12px;
  background-color: hsl(var(--muted) / 20%);
  border-top: 1px solid hsl(var(--border));
}

.kv-add .el-button {
  font-size: 13px;
}
</style>
