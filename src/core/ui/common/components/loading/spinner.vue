<script lang="ts" setup>
import { cn } from '#/core/shared/utils';
import { VbenSpinner } from '#/core/ui/primitives';

interface SpinnerProps {
  class?: string;
  /**
   * @zh_CN 最小加载时间
   * @en_US Minimum loading time
   */
  minLoadingTime?: number;
  /**
   * @zh_CN loading状态开启
   */
  spinning?: boolean;
}
defineOptions({ name: 'Spinner' });
const props = defineProps<SpinnerProps>();
</script>
<template>
  <div :class="cn('relative min-h-20', props.class)">
    <slot></slot>
    <VbenSpinner
      :min-loading-time="props.minLoadingTime"
      :spinning="props.spinning"
    />
  </div>
</template>
