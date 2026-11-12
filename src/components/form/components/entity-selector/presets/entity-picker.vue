<script setup lang="ts">
import type {
  SelectorColumn,
  SelectorDisplay,
  EntityPickerConfig,
  SelectorFetchParams,
  SelectorSearchField,
} from '../core/selector-types';

import { computed, useSlots } from 'vue';

import SelectorFooter from '../blocks/selector-footer.vue';
import SelectorSearchBar from '../blocks/selector-search-bar.vue';
import SelectorTableContent from '../blocks/selector-table-content.vue';
import SelectorShell from '../core/selector-shell.vue';
import { resolveEntityApi } from '../configs/resolve-api';
import type { ResolvedEntityPickerConfig } from '../configs/resolve-api';

/**
 * 通用 preset：按传入的实体配置（EntityPickerConfig）渲染选择器。
 * 仅声明列、检索字段、取数与单元格渲染，通用逻辑全部来自 SelectorShell。
 * 统一入口 entity-selector.vue 按类型标识注入对应配置；业务也可直接传入自定义配置复用外壳。
 */
interface Props {
  config: EntityPickerConfig;
  modelValue?: null | string | string[];
  /** 不传即单选（壳默认值） */
  selectMode?: 'multiple' | 'single';
  display?: SelectorDisplay;
  readonly?: boolean;
  /** 业务固定参数透传（部门联动范围等），经壳传给 config.fetcher 的 params.extra */
  fetchExtra?: Record<string, any>;
  disabled?: boolean;
  placeholder?: string;
  title?: string;
  dialogWidth?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'change', value: string | string[]): void;
  (e: 'update:modelValue', value: string | string[]): void;
}>();

/** fetcher / hydrate 字符串 API 路径归一化为函数（幂等）；壳仅消费函数形态 */
const normalizedConfig = computed(() => resolveEntityApi(props.config));

/** 组装取数函数：注入 config.fetcher 期望的联动上下文 */
function makeFetcher(config: ResolvedEntityPickerConfig) {
  return async (params: SelectorFetchParams) => {
    const ctx = {
      deptIds: (params.extra?.deptIds as string[] | undefined) ?? [],
      deptRootIds: (params.extra?.deptRootIds as string[] | undefined) ?? [],
    };
    return config.fetcher(params, ctx);
  };
}

const columns = computed(() => normalizedConfig.value.columns as SelectorColumn[]);
const searchFields = computed(
  () => normalizedConfig.value.searchFields as SelectorSearchField[],
);
const effectiveTitle = computed(
  () => props.title || normalizedConfig.value.title,
);
const effectivePlaceholder = computed(
  () =>
    props.placeholder ||
    normalizedConfig.value.placeholder ||
    '点击选择',
);
const effectiveLabelOf = computed(
  () =>
    normalizedConfig.value.labelOf ?? ((row: any) => String(row?.id ?? '')),
);

/** 仅向表格透传单元格插槽；壳保留插槽（search/content/footer/empty）不在此列 */
const reservedSlotNames = new Set(['content', 'empty', 'footer', 'search']);
const slots = useSlots();
const cellSlotNames = computed(() =>
  Object.keys(slots).filter((name) => !reservedSlotNames.has(name)),
);
</script>

<template>
  <SelectorShell
    :model-value="modelValue"
    :select-mode="selectMode"
    :display="display"
    :readonly="readonly"
    :disabled="disabled"
    :placeholder="effectivePlaceholder"
    :title="effectiveTitle"
    :dialog-width="dialogWidth"
    :columns="columns"
    :search-fields="searchFields"
    :search-mode="normalizedConfig.searchMode ?? 'single'"
    :fetcher="makeFetcher(normalizedConfig)"
    :fetch-extra="fetchExtra"
    :hydrate="normalizedConfig.hydrate"
    :label-of="effectiveLabelOf"
    :row-key="config.rowKey ?? 'id'"
    @update:model-value="(value) => emit('update:modelValue', value)"
    @change="(value) => emit('change', value)"
  >
    <template #search="sp">
      <SelectorSearchBar
        :keyword="sp.keyword"
        :search-field="sp.searchField"
        :search-fields="sp.searchFields"
        :search-mode="sp.searchMode"
        :filters="sp.filters"
        :loading="sp.loading"
        :display="sp.display"
        @update:keyword="sp.setKeyword"
        @update:search-field="sp.setSearchField"
        @update:filter="sp.setFilter"
        @search="sp.search"
        @reset="sp.reset"
      />
    </template>

    <template #content="sp">
      <SelectorTableContent
        :columns="sp.columns"
        :rows="sp.rows"
        :height="sp.tableHeight"
        :highlight-row-keys="sp.activeIds"
        :empty-text="sp.emptyText"
        :row-key="sp.rowKey"
        show-seq
        :cell-slots="sp.cellSlots"
        @row-click="sp.toggleRow"
      >
        <!-- 使用方自定义单元格插槽原样透传（保留插槽除外） -->
        <template v-for="name in cellSlotNames" #[name]="scope" :key="name">
          <slot :name="name" v-bind="scope ?? {}"></slot>
        </template>
      </SelectorTableContent>
    </template>

    <template #footer="sp">
      <SelectorFooter
        :page="sp.page"
        :page-size="sp.pageSize"
        :total="sp.total"
        :active-count="sp.activeIds.length"
        :active-items="sp.activeItems"
        :display="sp.display"
        :can-confirm="sp.canConfirm"
        @page-change="sp.setPage"
        @size-change="sp.setPageSize"
        @remove="(id) => sp.removeItem(id)"
        @clear="sp.clear"
        @done="sp.done"
        @cancel="sp.cancel"
        @confirm="sp.confirm"
      />
    </template>
  </SelectorShell>
</template>
