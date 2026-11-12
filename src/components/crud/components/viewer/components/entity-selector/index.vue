<script setup lang="ts">
/**
 * ReadEntitySelector 实体选择器查看器：
 * 部门/职位/角色/用户字段在表单中使用 EntitySelector 后，详情查看场景
 * 由本组件按 type 复用对应 config 的 hydrate 反查 id → 名称。
 * 空值显示 --；未命中/反查失败的 id 回退原值；整体异常不抛错。
 */
import { computed, ref, watch } from 'vue';

import {
  getEntityPickerConfig,
} from '#/components/form/components/entity-selector/configs/registry';
import type { EntityPickerConfig } from '#/components/form/components/entity-selector/core/selector-types';
import { resolveEntityApi } from '#/components/form/components/entity-selector/configs/resolve-api';
import { mergePluginConfig } from '#/components/plugin-component/merge-config';

import { isEmptyValue, normalizeListValue } from '../../format';

const props = withDefaults(
  defineProps<{
    data?: Record<string, any>;
    fieldName?: string;
    schema?: any;
    /** 实体类型：内置 dept / post / role / user，或插件经 registerEntityPickerConfig 注册的自定义类型（经 componentProps.type 透传） */
    type?: string;
    /** 配置注入（与表单侧 EntitySelector.componentProps.config 同源）：编辑/查看共用同一 schema 时自动透传 */
    config?: Partial<EntityPickerConfig>;
    value?: any;
  }>(),
  {
    value: undefined,
    fieldName: '',
    schema: undefined,
    data: () => ({}),
    type: undefined,
    config: undefined,
  },
);

/** 类型解析优先级：显式 type > schema.componentProps.type */
const resolvedType = computed<string | undefined>(() => {
  if (props.type) return props.type;
  const fromSchema = (props.schema?.componentProps as any)?.type;
  return typeof fromSchema === 'string' && fromSchema
    ? fromSchema
    : undefined;
});

const nameMap = ref<Map<string, string>>(new Map());
const loading = ref(false);

/** 值统一为字符串 id 列表（数组 / 单个 id / 逗号串） */
const ids = computed(() => normalizeListValue(props.value));

const displayValue = computed(() => {
  if (loading.value) return undefined;
  const list = ids.value;
  if (list.length === 0) return '--';
  if (nameMap.value.size === 0 && !hasFetched.value) return '--';
  return (
    list.map((id) => nameMap.value.get(id) || id).join(', ') || '--'
  );
});

/** 是否至少完成过一次反查（区分"无数据"与"未反查"） */
const hasFetched = ref(false);

const fetchNames = async () => {
  const type = resolvedType.value;
  const list = ids.value;
  if (!type || list.length === 0) {
    nameMap.value = new Map();
    hasFetched.value = true;
    return;
  }
  loading.value = true;
  try {
    // 配置解析与表单侧同规则：注入 config 深合并覆盖注册配置（注入优先），字符串 API 归一化
    const base = getEntityPickerConfig(type);
    const merged = props.config
      ? (mergePluginConfig(base, props.config) as EntityPickerConfig)
      : base;
    const config = resolveEntityApi(merged);
    if (!config?.hydrate) {
      nameMap.value = new Map();
      return;
    }
    // 并发反查（去重），单条失败不影响其余
    const unique = [...new Set(list)];
    const results = await Promise.allSettled(
      unique.map((id) => config.hydrate!(id)),
    );
    const map = new Map<string, string>();
    results.forEach((result, index) => {
      if (result.status !== 'fulfilled' || !result.value) return;
      const row: any = result.value;
      const label =
        config.labelOf?.(row) ?? row?.name ?? row?.label ?? row?.title;
      if (label) map.set(String(unique[index]), String(label));
    });
    nameMap.value = map;
  } catch {
    nameMap.value = new Map();
  } finally {
    hasFetched.value = true;
    loading.value = false;
  }
};

watch(
  () => [ids.value, resolvedType.value] as const,
  () => {
    void fetchNames();
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <span class="reader-entity-selector">
    <template v-if="loading">
      <span class="loading-text">加载中...</span>
    </template>
    <template v-else>
      <span v-if="isEmptyValue(displayValue) || displayValue === '--'" class="empty-value">--</span>
      <span v-else :title="displayValue">{{ displayValue }}</span>
    </template>
  </span>
</template>

<style lang="scss" scoped>
.reader-entity-selector {
  .loading-text,
  .empty-value {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
