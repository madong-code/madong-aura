<script setup lang="ts">
/**
 * ReadDate 日期查看器：Date / 时间戳（秒/毫秒自适配）/ ISO 串 统一格式化。
 * 配置经 schema.componentProps 或 viewComponentProps 传入：
 *   format?: string  dayjs 格式串，默认 'YYYY-MM-DD HH:mm:ss'
 * 无效日期输入安全回退 '--'，不抛错不显示 Invalid Date。
 */
import { computed } from 'vue';

import { formatDateValue, isEmptyValue } from '../../format';
import type { ViewerCommonProps } from '../../types';

const props = withDefaults(
  defineProps<
    ViewerCommonProps & {
      /** dayjs 格式串 */
      format?: string;
    }
  >(),
  {
    value: undefined,
    fieldName: '',
    schema: undefined,
    data: () => ({}),
    format: 'YYYY-MM-DD HH:mm:ss',
  },
);

const formatted = computed(() =>
  formatDateValue(props.value, { format: props.format }),
);

const isEmpty = computed(() => isEmptyValue(props.value));
</script>

<template>
  <span class="reader-date">
    <span v-if="isEmpty || formatted === '--'" class="empty-value">--</span>
    <span v-else>{{ formatted }}</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-date {
  .empty-value {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
