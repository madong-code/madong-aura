<script setup lang="ts">
/**
 * ReadAmount 金额查看器：千分位 + 精度 + 前后缀，空值/异常值兜底。
 * 配置经 schema.componentProps 或 viewComponentProps 传入：
 *   { precision?: number, prefix?: string, suffix?: string, separator?: boolean }
 */
import { computed } from 'vue';

import { formatAmountValue, isEmptyValue } from '../../format';
import type { ViewerCommonProps } from '../../types';

const props = withDefaults(
  defineProps<
    ViewerCommonProps & {
      /** 小数位精度，默认 2 */
      precision?: number;
      /** 货币/单位前缀 */
      prefix?: string;
      /** 是否千分位分隔，默认 true */
      separator?: boolean;
      /** 后缀单位 */
      suffix?: string;
    }
  >(),
  {
    value: undefined,
    fieldName: '',
    schema: undefined,
    data: () => ({}),
    precision: 2,
    prefix: '',
    separator: true,
    suffix: '',
  },
);

const formatted = computed(() =>
  formatAmountValue(props.value, {
    precision: props.precision,
    prefix: props.prefix,
    separator: props.separator,
    suffix: props.suffix,
  }),
);

const isEmpty = computed(() => isEmptyValue(props.value));
</script>

<template>
  <span class="reader-amount">
    <span v-if="isEmpty" class="empty-value">--</span>
    <span v-else :title="formatted">{{ formatted }}</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-amount {
  font-variant-numeric: tabular-nums;

  .empty-value {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
