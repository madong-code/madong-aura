<script lang="ts" setup>
import { ChevronRight } from 'lucide-vue-next';

import { cn } from '#/core/shared/utils';

const props = defineProps<{
  class?: any;
}>();
</script>

<template>
  <li
    :class="cn('[&>svg]:size-3.5', props.class)"
    aria-hidden="true"
    role="presentation"
  >
    <slot>
      <ChevronRight />
    </slot>
  </li>
</template>
