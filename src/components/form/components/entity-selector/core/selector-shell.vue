<script setup lang="ts">
import type { Slots } from 'vue';

import type {
  SelectorColumn,
  SelectorFetcher,
  SelectorSearchField,
  SelectorSlotProps,
} from './selector-types';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useSlots,
  watch,
} from 'vue';

import { onClickOutside, useDebounceFn, useWindowSize } from '@vueuse/core';
import { ElMessage, ElPopover, ElTag } from 'element-plus';

import { useDialog } from '#/components/dialog';
import { Icon } from '#/components/icon';

/**
 * 唯一「实体选择器」外层包装器（wrapper）。
 *
 * 壳只负责通用逻辑与样式：弹层形态、触发区、单选/多选状态机、v-model 归一化、
 * 服务端分页取数、防竞态、防抖、回填反查、加载与失败降级、外部点击关闭、宽度自适应。
 * 壳不渲染任何业务内容：search / content / footer / empty 四块全部由使用方插槽定义，
 * 状态与操作经 scoped slot props 暴露；表格等具体内容由使用方自行经 blocks 拼装。
 *
 * selectMode 默认 'single'（不传即单选），单选再次点击同一行清空；
 * 显式传 'multiple' 后可累加、移除、继续添加。
 * readonly 为只读详情形态：仅渲染已选文案 / 标签，不渲染触发区与弹层。
 * fetchExtra 为业务固定参数透传（如部门联动范围），变更时面板打开状态下自动重取。
 */
interface SelectedItem {
  id: string;
  label: string;
}

type ModelValue = null | string | string[] | undefined;

interface Props {
  modelValue?: ModelValue;
  /** 选择模式，默认单选 */
  selectMode?: 'multiple' | 'single';
  /** 弹层形态 */
  display?: 'dialog' | 'popover';
  /** 只读详情形态：仅展示已选文案，不渲染交互区 */
  readonly?: boolean;
  /** 使用方列定义，壳不感知，仅透传给内容插槽 */
  columns: SelectorColumn[];
  fetcher: SelectorFetcher;
  searchFields?: SelectorSearchField[];
  labelOf?: (row: any) => string;
  /** 仅有 id 时反查实体，补齐展示文案 */
  hydrate?: (id: string) => Promise<any | null>;
  rowKey?: string;
  /** 搜索模式：single 单字段下拉 + 关键词（默认）/ multi 多字段独立输入 */
  searchMode?: 'single' | 'multi';
  /** 业务固定参数透传给 fetcher（params.extra），深变时自动重取 */
  fetchExtra?: Record<string, any>;
  placeholder?: string;
  title?: string;
  dialogWidth?: string;
  tableHeight?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  selectMode: 'single',
  display: 'dialog',
  readonly: false,
  searchFields: () => [],
  searchMode: 'single',
  labelOf: (row: any) =>
    `${row?.code ?? ''} ${row?.name ?? ''}`.trim() || String(row?.id ?? ''),
  hydrate: undefined,
  rowKey: 'id',
  fetchExtra: undefined,
  placeholder: '点击选择',
  title: '选择',
  dialogWidth: '860px',
  tableHeight: undefined,
  disabled: false,
});

const emit = defineEmits<{
  (e: 'change', value: string | string[]): void;
  (e: 'update:modelValue', value: string | string[]): void;
}>();

const slots = useSlots();
const reservedSlots = new Set(['content', 'empty', 'footer', 'search']);
/** 非结构插槽（如状态列单元格）交给内容块透传到表格 */
const cellSlots = computed<Slots>(() =>
  Object.fromEntries(
    Object.entries(slots).filter(([name]) => !reservedSlots.has(name)),
  ),
);

const rootRef = ref<HTMLElement | null>(null);
const triggerInputRef = ref<HTMLInputElement | null>(null);
const visible = ref(false);
const loading = ref(false);
// ElPopover 受控打开（visible 驱动），trigger 需 'manual'，但当前 EP 类型未收录该值
const manualTrigger = 'manual' as any;
const searchField = ref(props.searchFields[0]?.value ?? '');
/** 各检索字段关键词（multi 模式逐字段输入；single 模式仅活动字段有值） */
const filters = ref<Record<string, string>>({});
/** 活动字段关键词（向后兼容 slotProps.keyword 与 popover 触发区输入），读写均落在 filters */
const keyword = computed<string>({
  get: () => filters.value[searchField.value] ?? '',
  set: (value) => {
    filters.value = { ...filters.value, [searchField.value]: value };
  },
});
/** 非空检索条件：多字段 AND 语义一起下发给 fetcher（params.filters） */
const nonEmptyFilters = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {};
  for (const [field, value] of Object.entries(filters.value)) {
    const trimmed = value.trim();
    if (trimmed) out[field] = trimmed;
  }
  return out;
});
const hasAnyFilter = computed(() => Object.keys(nonEmptyFilters.value).length > 0);
const rows = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
/** 已确认（对应 modelValue） */
const selected = ref<Map<string, SelectedItem>>(new Map());
/** 弹窗模式的暂存选择，取消即丢弃 */
const pending = ref<Map<string, SelectedItem>>(new Map());
let requestSeq = 0;

const { width: windowWidth } = useWindowSize();
const popoverWidth = computed(() =>
  Math.max(320, Math.min(560, windowWidth.value - 32)),
);
const tableHeight = computed(() =>
  props.tableHeight ?? (props.display === 'dialog' ? 380 : 260),
);

/**
 * dialog 形态使用框架封装弹窗（与 CRUD 弹窗风格统一）：
 * header 自带 全屏 / 关闭 按钮，底部为 取消 / 确定 栏；
 * 标题与宽度经模板 attrs 动态传入（useDialog 初始 props 优先级更高，避免覆盖）。
 */
const [SelectorDialog, selectorDialogApi] = useDialog({
  fullscreenButton: true,
});
const activeMap = computed(() =>
  props.display === 'dialog' ? pending.value : selected.value,
);
const activeIds = computed(() => [...activeMap.value.keys()]);
const activeItems = computed(() => [...activeMap.value.values()]);
const displayItems = computed(() => [...selected.value.values()]);
const displayLabel = computed(() =>
  displayItems.value.map((item) => item.label).join('、'),
);
const activeLabel = computed(() =>
  activeItems.value.map((item) => item.label).join('、'),
);
const emptyText = computed(() =>
  hasAnyFilter.value
    ? '没有匹配的数据，请调整关键词或搜索字段'
    : '输入关键词可快速定位',
);

function normalizeIds(value: ModelValue): string[] {
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

function emitValue() {
  const ids = [...selected.value.keys()];
  const value = props.selectMode === 'multiple' ? ids : (ids[0] ?? '');
  emit('update:modelValue', value);
  emit('change', value);
}

/** 服务端分页检索；只渲染最后一次响应，避免竞态覆盖 */
async function loadList() {
  const seq = ++requestSeq;
  loading.value = true;
  try {
    const res = await props.fetcher({
      page: page.value,
      limit: pageSize.value,
      keyword: keyword.value.trim(),
      field: searchField.value,
      filters: nonEmptyFilters.value,
      extra: props.fetchExtra,
    });
    if (seq !== requestSeq) return;
    rows.value = res?.items ?? [];
    total.value = Number(res?.total ?? 0);
  } catch (error: any) {
    if (seq !== requestSeq) return;
    ElMessage.error(error?.message ?? '列表加载失败');
    rows.value = [];
    total.value = 0;
  } finally {
    if (seq === requestSeq) loading.value = false;
  }
}

const debouncedSearch = useDebounceFn(() => {
  page.value = 1;
  loadList();
}, 300);

function setKeyword(value: string) {
  keyword.value = value;
}

function setSearchField(value: string) {
  // 仅记录检索字段，不自动检索；搜索仍需点击「搜索」按钮（按钮为唯一触发入口）
  searchField.value = value;
  page.value = 1;
}

/** multi 模式：设置某检索字段关键词；活动字段与 keyword 视图自动保持同步 */
function setFilter(field: string, value: string) {
  filters.value = { ...filters.value, [field]: value };
}

function onKeywordInput() {
  debouncedSearch();
}

function doSearch() {
  page.value = 1;
  loadList();
}

function resetSearch() {
  filters.value = {};
  searchField.value = props.searchFields[0]?.value ?? '';
  page.value = 1;
  loadList();
}

function handlePageChange(value: number) {
  page.value = value;
  loadList();
}

function handleSizeChange(value: number) {
  pageSize.value = value;
  page.value = 1;
  loadList();
}

function setActive(map: Map<string, SelectedItem>) {
  if (props.display === 'dialog') {
    pending.value = map;
  } else {
    selected.value = map;
    emitValue();
  }
}

function isSelected(row: any): boolean {
  return activeMap.value.has(String(row?.[props.rowKey] ?? ''));
}

function toggleRow(row: any) {
  if (props.disabled || !row) return;
  const id = String(row?.[props.rowKey] ?? '');
  if (!id) return;
  const label = props.labelOf(row) || id;
  const map = new Map(activeMap.value);
  if (props.selectMode === 'multiple') {
    if (map.has(id)) {
      map.delete(id);
      setActive(map);
      if (props.display === 'popover') ElMessage.success(`已取消选择「${label}」`);
    } else {
      map.set(id, { id, label });
      setActive(map);
    }
  } else {
    // 单选：再次点击已选中的行即清空（高亮、已选文案、确认按钮一并复原）
    const isSame = map.size === 1 && map.has(id);
    map.clear();
    if (!isSame) map.set(id, { id, label });
    setActive(map);
  }
}

function removeItem(id: string, event?: Event) {
  event?.stopPropagation();
  if (props.disabled) return;
  const label = selected.value.get(id)?.label ?? id;
  const next = new Map(selected.value);
  next.delete(id);
  selected.value = next;
  if (props.display === 'dialog') pending.value = new Map(next);
  ElMessage.success(`已移除「${label}」`);
  emitValue();
}

function clearAll() {
  if (activeMap.value.size === 0) return;
  if (props.display === 'dialog') {
    pending.value = new Map();
  } else {
    selected.value = new Map();
    emitValue();
  }
  ElMessage.success('已清空已选');
}

function openPanel() {
  if (props.disabled || visible.value) return;
  visible.value = true;
  if (rows.value.length === 0) loadList();
  nextTick(() => triggerInputRef.value?.focus());
}

function openDialog() {
  if (props.disabled) return;
  pending.value = new Map(selected.value);
  filters.value = {};
  searchField.value = props.searchFields[0]?.value ?? '';
  page.value = 1;
  visible.value = true;
  selectorDialogApi.open();
  loadList();
}

function done() {
  visible.value = false;
}

function cancel() {
  // 封装弹窗的关闭按钮 / 取消：内部已自行关闭，这里仅同步触发区状态
  visible.value = false;
}

function confirmDialog() {
  selected.value = new Map(pending.value);
  visible.value = false;
  selectorDialogApi.close();
  emitValue();
}

/** 仅有 id 的回填场景：按使用方配置反查实体，补齐展示文案 */
async function hydrateIds(ids: string[]) {
  if (!props.hydrate) return;
  const missing = ids.filter((id) => {
    const label = selected.value.get(id)?.label;
    return !label || label.startsWith('ID ');
  });
  if (missing.length === 0) return;
  const results = await Promise.allSettled(missing.map((id) => props.hydrate!(id)));
  const validIds = new Set(normalizeIds(props.modelValue));
  const next = new Map(selected.value);
  results.forEach((result, index) => {
    const id = missing[index] ?? '';
    if (!validIds.has(id) || !next.has(id)) return;
    const row = result.status === 'fulfilled' ? result.value : null;
    if (row) next.set(id, { id, label: props.labelOf(row) || id });
  });
  selected.value = next;
}

// 外部值变化（表单重置等）同步到内部集合；组件自身 emit 造成的回写内容一致，跳过
watch(
  () => props.modelValue,
  (value) => {
    const ids = normalizeIds(value);
    const current = [...selected.value.keys()];
    const same =
      ids.length === current.length && ids.every((id, index) => id === current[index]);
    if (same) return;
    const next = new Map<string, SelectedItem>();
    ids.forEach((id) => {
      next.set(id, selected.value.get(id) ?? { id, label: `ID ${id}` });
    });
    selected.value = next;
    if (props.display === 'dialog') pending.value = new Map(next);
    void hydrateIds(ids);
  },
  { immediate: true },
);

// 业务固定参数（如部门联动范围）变化：面板打开时立即重取，关闭时下次打开生效
watch(
  () => props.fetchExtra,
  () => {
    if (visible.value) loadList();
  },
  { deep: true },
);

onClickOutside(rootRef, (event) => {
  if (props.display !== 'popover') return;
  const target = event.target as HTMLElement | null;
  // 面板与浮层内控件 teleport 到 body，其内部点击不应关闭面板
  if (target?.closest?.('.selector-popper, .el-popper')) return;
  visible.value = false;
});

/**
 * ElPopover trigger='manual' 并非完全手动：ElTooltipContent 在 open 后会注册
 * onClickOutside（manual 不在 hover/focus 豁免列），点击弹层内容之外的任何元素
 * （包括本选择器触发输入框）都会请求关闭；content 失焦也会请求关闭，且经
 * useDelayedToggle 延迟 hideAfter(默认200ms) 执行——这正是「面板打开后无交互自关、
 * 且再聚焦也无法重开」的根因。故改为单向 :visible，壳层作为可见性唯一权威，
 * 仅当关闭源确实发生在选择器（根/弹层）之外时才采纳。
 */
let pointerInsideSelector = false;
function markPointer(event: Event) {
  const target = event.target as HTMLElement | null;
  pointerInsideSelector = Boolean(
    target?.closest?.('.selector-shell-root, .selector-popper, .el-popper'),
  );
}
onMounted(() => {
  document.addEventListener('pointerdown', markPointer, true);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', markPointer, true);
});

function onPopoverVisibleChange(next: boolean) {
  if (next) {
    visible.value = true;
    return;
  }
  // 关闭请求来自触发器点击/面板内部点击/EP 失焦路径：保持打开
  if (pointerInsideSelector) return;
  visible.value = false;
}

const slotProps = computed<SelectorSlotProps>(() => ({
  display: props.display,
  selectMode: props.selectMode,
  loading: loading.value,
  rows: rows.value,
  total: total.value,
  page: page.value,
  pageSize: pageSize.value,
  keyword: keyword.value,
  searchField: searchField.value,
  searchFields: props.searchFields,
  searchMode: props.searchMode,
  filters: filters.value,
  columns: props.columns,
  rowKey: props.rowKey,
  tableHeight: tableHeight.value,
  activeIds: activeIds.value,
  activeItems: activeItems.value,
  activeLabel: activeLabel.value,
  emptyText: emptyText.value,
  disabled: props.disabled,
  cellSlots: cellSlots.value,
  setKeyword,
  setSearchField,
  setFilter,
  keywordInput: onKeywordInput,
  search: doSearch,
  reset: resetSearch,
  setPage: handlePageChange,
  setPageSize: handleSizeChange,
  toggleRow,
  isSelected,
  removeItem,
  clear: clearAll,
  done,
  cancel,
  confirm: confirmDialog,
  canConfirm: activeIds.value.length > 0,
}));
</script>

<template>
  <!-- 单根容器：VbenForm 会注入 name/onBlur 等额外 attrs，多根片段会产生 fallthrough 警告 -->
  <div ref="rootRef" class="selector-shell-root">
    <!-- 只读详情形态：仅展示已选文案 / 标签，无交互区与弹层 -->
    <div v-if="readonly" class="selector-readonly">
      <template v-if="displayItems.length > 0">
        <template v-if="selectMode === 'multiple'">
          <ElTag
            v-for="item in displayItems"
            :key="item.id"
            class="selector-tag"
            size="small"
            type="info"
          >
            {{ item.label }}
          </ElTag>
        </template>
        <span v-else class="selector-readonly-text">{{ displayLabel }}</span>
      </template>
      <span v-else class="selector-readonly-empty">—</span>
    </div>

    <ElPopover
      v-else-if="display === 'popover'"
      :visible="visible"
      :trigger="manualTrigger"
      placement="bottom-start"
      :width="popoverWidth"
      :teleported="true"
      :disabled="disabled"
      popper-class="selector-popper"
      @update:visible="onPopoverVisibleChange"
    >
      <template #reference>
        <div
          class="selector-trigger"
          :class="{ 'is-disabled': disabled, 'is-active': visible }"
          @click="openPanel"
        >
          <ElTag
            v-for="item in displayItems"
            :key="item.id"
            class="selector-tag"
            closable
            size="small"
            type="info"
            @close="removeItem(item.id, $event)"
          >
            {{ item.label }}
          </ElTag>
          <input
            ref="triggerInputRef"
            v-model="keyword"
            class="selector-keyword-input"
            :placeholder="displayItems.length > 0 ? '' : placeholder"
            :disabled="disabled"
            @focus="openPanel"
            @input="onKeywordInput"
            @keyup.enter="doSearch"
          />
          <Icon class="selector-icon" icon="ant-design:search-outlined" />
        </div>
      </template>

      <div class="selector-panel">
        <slot name="search" v-bind="slotProps"></slot>
        <div v-loading="loading" class="selector-body">
          <template v-if="!loading && rows.length === 0 && $slots.empty">
            <slot name="empty" v-bind="slotProps"></slot>
          </template>
          <slot v-else name="content" v-bind="slotProps"></slot>
        </div>
        <slot name="footer" v-bind="slotProps"></slot>
      </div>
    </ElPopover>

    <template v-else>
      <!-- dialog 触发区：已选标签可点击移除；点击空白区打开弹窗继续选择 -->
      <div
        class="selector-trigger"
        :class="{ 'is-disabled': disabled, 'is-active': visible }"
        @click="openDialog"
      >
        <ElTag
          v-for="item in displayItems"
          :key="item.id"
          class="selector-tag"
          closable
          size="small"
          type="info"
          @close="removeItem(item.id, $event)"
        >
          {{ item.label }}
        </ElTag>
        <span
          v-if="displayItems.length === 0"
          class="selector-trigger-placeholder"
        >
          {{ placeholder }}
        </span>
        <Icon class="selector-icon" icon="ant-design:search-outlined" />
      </div>

      <!-- dialog：框架封装弹窗（header 全屏/关闭 + 底部 取消/确定 栏），默认可拖拽 -->
      <SelectorDialog
        :title="title"
        :width="dialogWidth"
        draggable
        fullscreen-button
        @cancel="cancel"
        @confirm="confirmDialog"
      >
        <div class="selector-panel selector-panel--dialog">
          <slot name="search" v-bind="slotProps"></slot>
          <div v-loading="loading" class="selector-body">
            <template v-if="!loading && rows.length === 0 && $slots.empty">
              <slot name="empty" v-bind="slotProps"></slot>
            </template>
            <slot v-else name="content" v-bind="slotProps"></slot>
          </div>
          <slot name="footer" v-bind="slotProps"></slot>
        </div>
      </SelectorDialog>
    </template>
  </div>
</template>

<style scoped>
.selector-shell-root {
  width: 100%;
}

.selector-trigger {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  width: 100%;
  min-height: 32px;
  padding: 3px 8px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  background: var(--el-fill-color-blank, #fff);
  cursor: pointer;
  transition: border-color 0.2s;
}

.selector-trigger.is-active {
  border-color: var(--el-color-primary, #409eff);
}

.selector-trigger.is-disabled {
  background: var(--el-fill-color-light, #f5f7fa);
  cursor: not-allowed;
}

.selector-tag {
  max-width: 190px;
}

.selector-trigger-placeholder {
  flex: 1 1 auto;
  color: var(--el-text-color-placeholder, #a8abb2);
  font-size: 13px;
}

.selector-readonly {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  width: 100%;
  min-height: 32px;
}

.selector-readonly-text {
  color: var(--el-text-color-regular, #606266);
}

.selector-readonly-empty {
  color: var(--el-text-color-placeholder, #a8abb2);
}

.selector-keyword-input {
  flex: 1 1 90px;
  min-width: 90px;
  height: 24px;
  padding: 0 2px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--el-text-color-regular, #606266);
  font-size: 13px;
}

.selector-icon {
  flex: 0 0 auto;
  /* 标签占位时保证放大镜始终贴右侧 */
  margin-left: auto;
  color: var(--el-text-color-placeholder, #a8abb2);
}

.selector-body {
  min-height: 120px;
}

/* dialog 形态：封装弹窗 body padding 为 0，内容区自补边距（popover 面板不受影响） */
.selector-panel--dialog {
  padding: 16px 20px 8px;
}
</style>
