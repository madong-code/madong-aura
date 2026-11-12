<script setup lang="ts">
import type { SelectorDisplay, SelectorItem } from '../core/selector-types';

import { ElButton, ElPagination, ElTag } from 'element-plus';

/** 可选内容块：分页与底部操作区。纯受控，按 display 分支展示。
 * dialog 形态的 取消/确定 由框架封装弹窗 footer 栏承担，此处仅渲染分页与已选 tags。 */
interface Props {
  page?: number;
  pageSize?: number;
  total?: number;
  activeCount?: number;
  activeItems?: SelectorItem[];
  display?: SelectorDisplay;
  canConfirm?: boolean;
}

withDefaults(defineProps<Props>(), {
  page: 1,
  pageSize: 20,
  total: 0,
  activeCount: 0,
  activeItems: () => [],
  display: 'dialog',
  canConfirm: false,
});

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'clear'): void;
  (e: 'confirm'): void;
  (e: 'done'): void;
  (e: 'pageChange', page: number): void;
  (e: 'sizeChange', size: number): void;
  (e: 'remove', id: string): void;
}>();
</script>

<template>
  <div class="mt-2 flex flex-wrap items-center gap-2">
    <ElPagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      :pager-count="5"
      layout="sizes, prev, pager, next"
      small
      @current-change="(v: any) => emit('pageChange', Number(v))"
      @size-change="(v: any) => emit('sizeChange', Number(v))"
    />
    <span class="text-xs text-slate-400">约 {{ total.toLocaleString() }} 条</span>
    <!-- 已选 tags：点击 × 直接移除（dialog / popover 通用），多选自动换行 -->
    <div
      v-if="activeItems.length > 0"
      class="ml-auto flex max-w-[60%] flex-wrap items-center justify-end gap-1"
    >
      <ElTag
        v-for="item in activeItems"
        :key="item.id"
        closable
        size="small"
        type="info"
        @close="emit('remove', item.id)"
      >
        {{ item.label }}
      </ElTag>
    </div>
    <span v-else class="ml-auto text-xs text-slate-400">未选择</span>
    <template v-if="display === 'popover'">
      <ElButton
        size="small"
        text
        :disabled="activeCount === 0"
        @click="emit('clear')"
      >
        清空
      </ElButton>
      <ElButton size="small" type="primary" @click="emit('done')">
        完成
      </ElButton>
    </template>
  </div>

  <p class="mt-1 text-xs text-slate-400">
    点击行选择 / 取消；单选再次点击同一行清空，已选行高亮，可跨页累积。
  </p>
</template>
