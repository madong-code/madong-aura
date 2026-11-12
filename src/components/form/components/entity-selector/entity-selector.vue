<script setup lang="ts">
import type { EntityPickerConfig, SelectorDisplay } from './core/selector-types';

import { computed, ref, watch } from 'vue';

import { ElMessage } from 'element-plus';

import { mergePluginConfig } from '#/components/plugin-component/merge-config';

import EntityPicker from './presets/entity-picker.vue';
import { resolveEntityApi } from './configs/resolve-api';
import type { ResolvedEntityPickerConfig } from './configs/resolve-api';
import { getEntityPickerConfig } from './configs/registry';
import { collectSubtreeIds, loadDeptTree } from './configs/dept-tree';

/**
 * 统一调用入口：业务模块只需传 type + 必要配置即可调用内置选择器，
 * 完全屏蔽底层选择器外壳实现细节。
 *
 * 内置类型：user（用户）/ role（角色）/ dept（部门）/ post（职位）。
 *
 * 部门联动（deptIds）：
 * - deptIds 传入部门（支持数组 / 逗号分隔串）后，可选数据强制限定为该部门及其全部子部门：
 *   dept 类型裁剪部门树；post / user 类型按 IN_dept_id 服务端过滤；
 * - deptStrict（默认 true）为强制限定：上级部门变更时自动校验已选值，
 *   超出范围的已选项自动清理并回传新值，实现「上级部门变更 → 下级可选数据联动过滤」。
 * - extraParams 可附带其他业务固定参数，经 fetchExtra 原样透传给取数函数。
 */
interface Props {
  /** 选择器类型标识：内置 user/role/dept/post，或经 registerEntityPickerConfig 注册的自定义类型 */
  type: string;
  /**
   * 配置整体注入（标准化包装器模式）：可由 defineEntityConfig 预定义为独立配置文件，
   * 导入后经 componentProps.config 整体传入，优先级高于 registry 注册配置（深合并），
   * 无需再调用 registerEntityPickerConfig 预注册。
   */
  config?: Partial<EntityPickerConfig>;
  modelValue?: null | string | string[];
  /** 不传即单选 */
  selectMode?: 'multiple' | 'single';
  /** 弹层形态：dialog 弹窗（表单默认）/ popover 浮层（搜索筛选紧凑形态） */
  display?: SelectorDisplay;
  /** 只读详情形态：仅展示已选文案 */
  readonly?: boolean;
  /** 强制限定部门：传入部门（含其子部门）内可选，支持数组 / 逗号分隔串 */
  deptIds?: null | string | string[];
  /** 是否强校验已选值（deptIds 变更时自动清理越界已选），默认 true */
  deptStrict?: boolean;
  /** 其他业务固定参数，透传给取数函数 params.extra */
  extraParams?: Record<string, any>;
  disabled?: boolean;
  placeholder?: string;
  title?: string;
  dialogWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  selectMode: 'single',
  display: 'dialog',
  readonly: false,
  deptIds: null,
  deptStrict: true,
  extraParams: undefined,
  disabled: false,
  placeholder: undefined,
  title: undefined,
  dialogWidth: '860px',
  config: undefined,
});

const emit = defineEmits<{
  (e: 'change', value: string | string[]): void;
  (e: 'update:modelValue', value: string | string[]): void;
}>();

/** 取配置：注入 config 深合并覆盖注册配置（注入优先），fetcher/hydrate 字符串归一化，均无则空配置兜底 */
const safeConfig = computed<ResolvedEntityPickerConfig>(() => {
  const registered = getEntityPickerConfig(props.type);
  const merged = props.config
    ? (mergePluginConfig(registered, props.config) as EntityPickerConfig)
    : registered;
  return resolveEntityApi(merged) ?? {
    type: props.type,
    title: '未知选择器类型',
    placeholder: '未注册的选择器类型',
    columns: [],
    searchFields: [],
    fetcher: async () => ({ items: [], total: 0 }),
  };
});

// ---------- 部门联动范围解析 ----------
function normalizeIds(value: null | string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'number') return [String(value)];
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }
  return [];
}

/** 使用方原始传入的部门范围 */
const deptRootIds = computed(() => normalizeIds(props.deptIds));
/** 展开子部门后的限定部门集合（空数组表示不限定） */
const resolvedDeptIds = ref<string[]>([]);

async function resolveDeptScope(rootIds: string[]): Promise<string[]> {
  if (rootIds.length === 0) return [];
  try {
    const tree = await loadDeptTree();
    return collectSubtreeIds(tree, rootIds);
  } catch {
    // 树加载失败时退化为原始传入范围，不阻塞选择
    return rootIds;
  }
}

watch(
  deptRootIds,
  async (rootIds) => {
    const prevResolved = resolvedDeptIds.value;
    resolvedDeptIds.value = await resolveDeptScope(rootIds);
    // 强制限定解除（非空 → 空）：前置条件消失，自动清空关联已选，避免禁用态残留脏数据
    if (
      props.deptStrict &&
      prevResolved.length > 0 &&
      resolvedDeptIds.value.length === 0 &&
      normalizeIds(props.modelValue).length > 0
    ) {
      const value = props.selectMode === 'multiple' ? [] : '';
      emit('update:modelValue', value);
      emit('change', value);
      ElMessage.warning('部门限定已解除，已自动清空关联已选项');
    }
    void enforceDeptScope();
  },
  { immediate: true, deep: true },
);

// ---------- 已选值强校验（deptStrict） ----------
const hydratedRowCache = new Map<string, any | null>();

async function hydrateCached(id: string): Promise<any | null> {
  if (hydratedRowCache.has(id)) return hydratedRowCache.get(id)!;
  const config0 = safeConfig.value;
  if (!config0.hydrate) return null;
  const promise = config0
    .hydrate(id)
    .then((row) => {
      hydratedRowCache.set(id, row);
      return row;
    })
    .catch(() => {
      hydratedRowCache.delete(id);
      return null;
    });
  hydratedRowCache.set(id, null);
  return promise;
}

/**
 * 强制限定联动：deptIds 变更后校验已选值。
 * - dept 类型：选中 id 必须在限定集合内；
 * - post / user 类型：实体的 deptField（dept_id）必须在限定集合内；
 * - 校验需要实体行数据时经 hydrate 反查（带缓存）；反查失败的项保留，避免误删数据。
 * 越界项清理后回传新值，外部表单数据随之联动收敛。
 */
async function enforceDeptScope() {
  if (!props.deptStrict) return;
  const allowed = resolvedDeptIds.value;
  if (allowed.length === 0) return;
  const ids = normalizeIds(props.modelValue);
  if (ids.length === 0) return;

  const allowedSet = new Set(allowed);
  const config0 = safeConfig.value;
  const kept: string[] = [];
  for (const id of ids) {
    if (config0.type === 'dept' || !config0.deptField) {
      if (allowedSet.has(id)) kept.push(id);
      continue;
    }
    const row = await hydrateCached(id);
    // 反查失败（网络异常等）保留原值，不做破坏性清理
    if (!row) {
      kept.push(id);
      continue;
    }
    const deptId = String(row[config0.deptField] ?? '');
    if (allowedSet.has(deptId)) kept.push(id);
  }

  if (kept.length === ids.length) return;
  const removed = ids.length - kept.length;
  const value =
    props.selectMode === 'multiple' ? kept : (kept[0] ?? '');
  emit('update:modelValue', value);
  emit('change', value);
  ElMessage.warning(`已按部门限定范围自动移除 ${removed} 个超出范围的已选项`);
}

// ---------- 取数固定参数透传 ----------
const fetchExtra = computed<Record<string, any>>(() => ({
  ...props.extraParams,
  deptIds: resolvedDeptIds.value,
  deptRootIds: deptRootIds.value,
}));
</script>

<template>
  <EntityPicker
    :config="safeConfig"
    :model-value="modelValue"
    :select-mode="selectMode"
    :display="display"
    :readonly="readonly"
    :fetch-extra="fetchExtra"
    :disabled="disabled"
    :placeholder="placeholder"
    :title="title"
    :dialog-width="dialogWidth"
    @update:model-value="(value) => emit('update:modelValue', value)"
    @change="(value) => emit('change', value)"
  >
    <!-- 自定义单元格插槽原样透传至表格 -->
    <template v-for="(_, name) in $slots" #[name]="scope" :key="name">
      <slot :name="name" v-bind="scope ?? {}"></slot>
    </template>
  </EntityPicker>
</template>
