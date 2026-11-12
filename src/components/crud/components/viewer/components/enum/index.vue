<script setup lang="ts">
/**
 * ReadEnum 枚举查看器：值 → label 映射，支持 Tag 着色，未命中回退原值。
 * 配置经 schema.componentProps 或 viewComponentProps 传入（二选一）：
 *   options?: [{ label, value, color? }] 或 { '1': '启用', '0': '禁用' }
 *   tag?: boolean  是否用 ElTag 展示（默认 true）
 */
import { computed } from 'vue';

import { ElTag } from 'element-plus';

import { formatEnumValue, isEmptyValue } from '../../format';
import type { ViewerCommonProps, ViewerEnumOption } from '../../types';

const props = withDefaults(
  defineProps<
    ViewerCommonProps & {
      /** 枚举映射：数组或键值对象 */
      options?: ViewerEnumOption[] | Record<number | string, string>;
      /** 是否使用 Tag 展示，默认 true */
      tag?: boolean;
    }
  >(),
  {
    value: undefined,
    fieldName: '',
    schema: undefined,
    data: () => ({}),
    options: () => [],
    tag: true,
  },
);

const result = computed(() =>
  formatEnumValue(props.value, props.options as any),
);

const isEmpty = computed(() => isEmptyValue(props.value));

/** Tag 颜色映射（仅数组配置命中且提供 color 时着色） */
const tagColor = computed(() => {
  if (typeof props.options === 'string') return undefined;
  if (!Array.isArray(props.options)) return undefined;
  const hit = props.options.find(
    (item) => String(item.value) === String(props.value),
  );
  return hit?.color;
});
</script>

<template>
  <span class="reader-enum">
    <span v-if="isEmpty" class="empty-value">--</span>
    <ElTag
      v-else-if="tag"
      :type="tagColor ?? (result.matched ? 'primary' : 'info')"
      disable-transitions
      size="small"
    >
      {{ result.label }}
    </ElTag>
    <span v-else>{{ result.label }}</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-enum {
  .empty-value {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
