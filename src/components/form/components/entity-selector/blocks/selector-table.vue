<script setup lang="ts">
/**
 * 无状态 VxeGrid 渲染层：列、单元格内容与空态均由使用方定义。
 * 选择模式 / 取数 / 弹层属于 selector 包装器职责，不在本组件内。
 */
import type { SelectorColumn } from '../core/selector-types';

import { computed, ref, useSlots } from 'vue';

import { VxeGrid } from 'vxe-table';

/** 统一视觉/交互默认值 */
const SELECTOR_GRID_DEFAULTS = {
  border: 'inner',
  stripe: true,
  size: 'small',
  align: 'center',
  showOverflow: 'tooltip',
  showHeaderOverflow: 'tooltip',
  autoResize: true,
  round: true,
  columnConfig: { resizable: true },
  rowConfig: { isHover: true, keyField: 'id' },
  // 表格均为本地静态数据，显式禁用远程代理，避免继承全局 proxyConfig.autoLoad
  proxyConfig: { enabled: false },
};

/** 统一列头：按需插入序号列 */
function selectorColumns(columns: SelectorColumn[], showSeq = false) {
  return showSeq
    ? [{ type: 'seq', title: '序号', width: 60, align: 'center' }, ...columns]
    : columns;
}

interface Props {
  /** 列定义（vxe 列格式，支持 slots.default 指向具名插槽） */
  columns: SelectorColumn[];
  /** 本地静态数据 */
  data?: any[];
  /** 固定高度（不传则用 maxHeight 限高） */
  height?: number | string;
  /** 最大高度，默认 400 */
  maxHeight?: number | string;
  /** 空态文案 */
  emptyText?: string;
  /** 行唯一键 */
  rowKey?: string;
  /** 是否显示序号列 */
  showSeq?: boolean;
  /** 虚拟滚动配置（大数据面板启用，如 { enabled: true, gt: 0 }） */
  scrollY?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  height: undefined,
  maxHeight: 400,
  emptyText: '暂无数据',
  rowKey: 'id',
  showSeq: false,
  scrollY: undefined,
});

// 可选：点击单元格所在行（供选择器做「点行即选中」）
const emit = defineEmits<{ (e: 'rowClick', row: any): void }>();
function handleCellClick({ row }: { row: any }) {
  emit('rowClick', row);
}

const slots = useSlots();
// 透传所有具名插槽（empty 单独处理，以便提供统一默认空态）
const delegatedSlots = computed(() =>
  Object.keys(slots).filter((key) => key !== 'empty'),
);

/**
 * 高亮采用 vxe 原生 rowClassName（渲染期求值）：highlightKeys 为组件内 ref，
 * 变化时触发 VxeGrid patch；vxe 以 rowid 为行 key 做 vnode diff，仅更新行
 * class 而复用单元格 DOM——既保证高亮在滚动/树展开/分页后恒正确，又避免
 * 自定义插槽单元格卸载重建导致的闪烁。
 *
 * 不再使用「操作行 DOM class」方案：vxe 4.x 行 DOM 的 rowid 属性语义随版本
 * 而异（encodeURIComponent(keyField) / 内部键），且内部键字段（_X_ROW_KEY）
 * 在新版本行对象上已不存在，命令式比对天然脆弱。
 */
const highlightKeys = ref<Array<number | string>>([]);

const selectedIdSet = computed(() => new Set(highlightKeys.value.map(String)));

const rowClassNameHandler = ({ row }: { row: any }) => {
  const id = row?.[props.rowKey];
  return id !== undefined && id !== null && selectedIdSet.value.has(String(id))
    ? 'selector-row-highlight'
    : '';
};

function setHighlight(keys: Array<number | string>) {
  highlightKeys.value = keys ?? [];
}

defineExpose({ setHighlight });

const options = computed<Record<string, any>>(() => {
  const base: Record<string, any> = {
    ...SELECTOR_GRID_DEFAULTS,
    rowConfig: {
      ...SELECTOR_GRID_DEFAULTS.rowConfig,
      keyField: props.rowKey,
    },
    rowClassName: rowClassNameHandler,
    maxHeight: props.maxHeight ?? 400,
    emptyText: props.emptyText,
    columns: selectorColumns(props.columns, props.showSeq),
    data: props.data ?? [],
  };
  if (props.height !== undefined) {
    base.height = props.height;
    // 虚拟滚动需要确定的高度，避免 height 与 maxHeight 同时生效
    delete base.maxHeight;
  }
  if (props.scrollY !== undefined) {
    base.scrollY = props.scrollY;
  }
  return base;
});
</script>

<template>
  <VxeGrid v-bind="options" @cell-click="handleCellClick">
    <template v-for="name in delegatedSlots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}"></slot>
    </template>
    <template #empty>
      <slot name="empty">
        <span class="text-xs text-slate-400">{{ emptyText }}</span>
      </slot>
    </template>
  </VxeGrid>
</template>

<style scoped>
:deep(.selector-row-highlight) {
  background-color: var(--el-color-primary-light-9, #ecf5ff) !important;
}

:deep(.selector-row-highlight:hover) {
  background-color: var(--el-color-primary-light-8, #d9ecff) !important;
}

:deep(.selector-row-highlight .vxe-cell) {
  color: var(--el-color-primary, #409eff);
  font-weight: 500;
}
</style>
