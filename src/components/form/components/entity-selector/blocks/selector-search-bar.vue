<script setup lang="ts">
import type { SelectorDisplay, SelectorSearchField } from '../core/selector-types';

import { ElButton, ElInput, ElOption, ElSelect } from 'element-plus';

/**
 * 可选内容块：搜索区。纯受控，不持有任何选择状态。
 * 搜索仅在用户主动点击「搜索」按钮或输入框回车时触发，输入不自动检索。
 * - single（默认）：字段下拉 + 单关键词输入（关键词作用于活动字段）；
 * - multi：每个检索字段独立输入框，非空条件合并后一起下发（AND 语义），
 *   另提供「重置」一键清空全部条件。
 */
interface Props {
  /** 活动字段关键词（single 模式输入；popover 触发区快速筛选联动） */
  keyword?: string;
  /** 活动字段 */
  searchField?: string;
  searchFields?: SelectorSearchField[];
  /** 搜索模式：single 单字段 / multi 多字段独立输入 */
  searchMode?: 'single' | 'multi';
  /** 各检索字段当前关键词（multi 模式逐字段绑定） */
  filters?: Record<string, string>;
  loading?: boolean;
  display?: SelectorDisplay;
}

withDefaults(defineProps<Props>(), {
  keyword: '',
  searchField: '',
  searchFields: () => [],
  searchMode: 'single',
  filters: () => ({}),
  loading: false,
  display: 'dialog',
});

const emit = defineEmits<{
  (e: 'search'): void;
  (e: 'reset'): void;
  (e: 'update:keyword', value: string): void;
  (e: 'update:searchField', value: string): void;
  (e: 'update:filter', field: string, value: string): void;
}>();
</script>

<template>
  <div class="mb-2 flex flex-wrap items-center gap-2">
    <!-- multi：每个检索字段独立输入，非空条件 AND 下发 -->
    <template
      v-if="searchMode === 'multi' && searchFields.length > 0 && display === 'dialog'"
    >
      <ElInput
        v-for="field in searchFields"
        :key="field.value"
        :model-value="filters?.[field.value] ?? ''"
        :placeholder="field.label"
        clearable
        style="width: 180px"
        @update:model-value="
          (v: any) => emit('update:filter', field.value, String(v))
        "
        @keyup.enter="emit('search')"
      />
      <ElButton type="primary" :loading="loading" @click="emit('search')">
        搜索
      </ElButton>
      <ElButton
        :disabled="Object.values(filters ?? {}).every((v) => !String(v).trim())"
        @click="emit('reset')"
      >
        重置
      </ElButton>
    </template>

    <!-- single（默认）：字段下拉 + 单关键词 -->
    <template v-else>
      <ElSelect
        v-if="searchFields.length > 0"
        :model-value="searchField"
        style="width: 120px"
        @update:model-value="(v: any) => emit('update:searchField', String(v))"
      >
        <ElOption
          v-for="option in searchFields"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
      <ElInput
        v-if="display === 'dialog'"
        :model-value="keyword"
        placeholder="输入关键字后点击搜索"
        clearable
        style="width: 240px"
        @update:model-value="(v: any) => emit('update:keyword', String(v))"
      />
      <ElButton
        v-if="display === 'dialog'"
        type="primary"
        :loading="loading"
        @click="emit('search')"
      >
        搜索
      </ElButton>
    </template>
  </div>
</template>
