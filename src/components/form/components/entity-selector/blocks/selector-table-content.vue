<script setup lang="ts">
import type { Slots } from 'vue';

import type { SelectorColumn } from '../core/selector-types';

import { computed, defineComponent, onMounted, ref, useSlots, watch } from 'vue';

import SelectorTable from './selector-table.vue';

/**
 * 可选内容块：表格区。复用无状态 VxeGrid 渲染层。
 * 自身具名插槽与壳透传的 cellSlots 均可渲染单元格，使用方按需覆盖。
 */
interface Props {
  columns: SelectorColumn[];
  rows?: any[];
  height?: number;
  highlightRowKeys?: string[];
  emptyText?: string;
  rowKey?: string;
  /** 是否显示行号列 */
  showSeq?: boolean;
  cellSlots?: Slots;
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [],
  height: 320,
  highlightRowKeys: () => [],
  emptyText: '暂无数据',
  rowKey: 'id',
  showSeq: false,
  cellSlots: () => ({}),
});

const emit = defineEmits<{ (e: 'rowClick', row: any): void }>();

// 稳定常量，避免每次父组件重渲染都生成新对象引用而强制造表格重渲染
const SCROLL_Y = { enabled: true, gt: 0 };

// 高亮经 SelectorTable.setHighlight 命令式注入：选中行只切换行 DOM class，
// 不重渲染表格，从而避免唯一走自定义插槽的单元格闪烁。
const gridRef = ref<any>();
function syncHighlight() {
  gridRef.value?.setHighlight(props.highlightRowKeys ?? []);
}
watch(() => props.highlightRowKeys, syncHighlight);
onMounted(syncHighlight);

const slots = useSlots();
const slotNames = computed(() => [
  ...new Set([...Object.keys(slots), ...Object.keys(props.cellSlots ?? {})]),
]);

/** 把壳透传的单元格插槽函数桥接成可渲染节点 */
const SlotBridge = defineComponent({
  props: {
    renderer: { type: Function, default: undefined },
    scope: { type: Object, default: () => ({}) },
  },
  setup: (options: any) => () =>
    options.renderer ? options.renderer(options.scope ?? {}) : null,
});
</script>

<template>
  <SelectorTable
    ref="gridRef"
    :columns="columns"
    :data="rows"
    :height="height"
    :scroll-y="SCROLL_Y"
    :empty-text="emptyText"
    :row-key="rowKey"
    :show-seq="showSeq"
    @row-click="(row) => emit('rowClick', row)"
  >
    <template v-for="name in slotNames" #[name]="cellScope">
      <slot :name="name" v-bind="cellScope ?? {}">
        <SlotBridge :renderer="cellSlots?.[name]" :scope="cellScope" />
      </slot>
    </template>
  </SelectorTable>
</template>
