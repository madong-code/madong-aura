<script setup lang="ts">
import { ref, watch } from 'vue';

import { ElButton, ElInput, ElOption, ElSelect } from 'element-plus';

import { Icon } from '#/components/icon';

interface RepoItem {
  type: string;
  label: string;
  url: string;
  command: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: RepoItem[];
  }>(),
  { modelValue: () => [] },
);

const emit = defineEmits<{
  'update:modelValue': [value: RepoItem[]];
}>();

/** 常用仓库渠道（支持输入自定义值） */
const TYPE_OPTIONS = [
  { value: 'github', label: 'GitHub' },
  { value: 'gitee', label: 'Gitee' },
  { value: 'composer', label: 'Composer' },
  { value: 'npm', label: 'npm' },
  { value: 'docker', label: 'Docker' },
  { value: 'zip', label: '安装包' },
  { value: 'web', label: '链接' },
];

/** 规范化外部值（容错 null / 字符串 JSON / 异常结构） */
const normalize = (value: any): RepoItem[] => {
  if (typeof value === 'string' && value.trim()) {
    try {
      return normalize(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return value.map((item) => ({
      type: String(item?.type ?? 'web'),
      label: String(item?.label ?? ''),
      url: String(item?.url ?? ''),
      command: String(item?.command ?? ''),
    }));
  }
  return [];
};

const list = ref<RepoItem[]>([]);

// 标记最近一次向外 emit 的值，避免 watch 响应自身 emit 导致循环重置
let lastEmittedJson = '';

watch(
  () => props.modelValue,
  (newVal) => {
    const json = JSON.stringify(newVal ?? null);
    if (json === lastEmittedJson) return;
    list.value = normalize(newVal);
  },
  { deep: true, immediate: true },
);

const emitChange = () => {
  // 过滤掉完全空白的行
  const result = list.value
    .filter((item) => item.url.trim() || item.label.trim() || item.command.trim())
    .map((item) => ({ ...item }));
  lastEmittedJson = JSON.stringify(result);
  emit('update:modelValue', result);
};

const addRow = () => {
  list.value = [...list.value, { type: 'github', label: '', url: '', command: '' }];
};

const removeRow = (index: number) => {
  const newList = [...list.value];
  newList.splice(index, 1);
  list.value = newList;
  emitChange();
};

const typeLabel = (type: string) =>
  TYPE_OPTIONS.find((option) => option.value === type)?.label || type;
</script>

<template>
  <div class="repos-editor">
    <!-- 空状态 -->
    <div v-if="list.length === 0" class="repos-empty">
      {{ $t('ui.form.reposEmpty', '暂无仓库入口，点击下方按钮添加') }}
    </div>

    <!-- 入口卡片 -->
    <div v-for="(item, index) of list" :key="index" class="repo-card">
      <div class="repo-card-head">
        <span class="repo-index">{{ index + 1 }}</span>
        <span class="repo-title">{{ typeLabel(item.type) || `入口 ${index + 1}` }}</span>
        <ElButton type="danger" link class="repo-delete" @click="removeRow(index)">
          <Icon icon="lucide:trash-2" />
        </ElButton>
      </div>

      <div class="repo-field-row">
        <div class="repo-field repo-field-type">
          <span class="repo-field-label">
            {{ $t('ui.form.reposChannel', '渠道') }}
          </span>
          <ElSelect
            v-model="item.type"
            filterable
            allow-create
            default-first-option
            :placeholder="$t('ui.form.reposChannelPlaceholder', '选择或输入渠道')"
            @change="emitChange"
          >
            <ElOption
              v-for="option in TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </div>
        <div class="repo-field">
          <span class="repo-field-label">
            {{ $t('ui.form.reposLabel', '显示名') }}
          </span>
          <ElInput
            v-model="item.label"
            :placeholder="$t('ui.form.reposLabelPlaceholder', '如：GitHub 主仓库')"
            @input="emitChange"
          />
        </div>
      </div>

      <div class="repo-field">
        <span class="repo-field-label">{{ $t('ui.form.reposUrl', '链接') }}</span>
        <ElInput
          v-model="item.url"
          :placeholder="$t('ui.form.reposUrlPlaceholder', 'https://github.com/...')"
          @input="emitChange"
        />
      </div>

      <div class="repo-field">
        <span class="repo-field-label">
          {{ $t('ui.form.reposCommand', '命令（可选）') }}
        </span>
        <ElInput
          v-model="item.command"
          :placeholder="
            $t(
              'ui.form.reposCommandPlaceholder',
              '如：git clone ... / composer require ...',
            )
          "
          @input="emitChange"
        />
      </div>
    </div>

    <!-- 添加按钮 -->
    <ElButton type="primary" plain class="repos-add" @click="addRow">
      <Icon icon="lucide:plus" />
      <span>{{ $t('ui.form.reposAdd', '添加仓库入口') }}</span>
    </ElButton>
  </div>
</template>

<style scoped>
.repos-editor {
  width: 100%;
}

/* 空状态 */
.repos-empty {
  padding: 16px 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  text-align: center;
  background-color: hsl(var(--muted) / 30%);
  border: 1px dashed hsl(var(--border));
  border-radius: calc(var(--radius) / 3 + 2px);
}

/* 入口卡片 */
.repo-card {
  padding: 10px 12px;
  margin-bottom: 8px;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) / 3 + 2px);
  transition: border-color 0.2s;
}

.repo-card:hover {
  border-color: hsl(var(--primary) / 40%);
}

.repo-card-head {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px dashed hsl(var(--border));
}

.repo-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
  background-color: hsl(var(--primary) / 12%);
  border-radius: 4px;
}

.repo-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.repo-delete {
  padding: 4px;
}

/* 字段布局 */
.repo-field-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 8px;
}

.repo-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.repo-field:last-child {
  margin-bottom: 0;
}

.repo-field-label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 添加按钮 */
.repos-add {
  width: 100%;
}
</style>
