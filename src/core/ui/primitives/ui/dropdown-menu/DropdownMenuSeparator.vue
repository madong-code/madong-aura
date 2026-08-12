<script setup lang="ts">
import type { DropdownMenuSeparatorProps } from 'reka-ui';

import { computed } from 'vue';

import { DropdownMenuSeparator } from 'reka-ui';

import { cn } from '#/core/shared/utils';

const props = defineProps<
  DropdownMenuSeparatorProps & {
    class?: any;
  }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <DropdownMenuSeparator
    v-bind="delegatedProps"
    :class="cn('bg-border -mx-1 my-1 h-px', props.class)"
  />
</template>
