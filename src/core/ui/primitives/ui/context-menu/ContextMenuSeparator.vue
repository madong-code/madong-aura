<script setup lang="ts">
import type { ContextMenuSeparatorProps } from 'reka-ui';

import { computed } from 'vue';

import { ContextMenuSeparator } from 'reka-ui';

import { cn } from '#/core/shared/utils';

const props = defineProps<ContextMenuSeparatorProps & { class?: any }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <ContextMenuSeparator
    v-bind="delegatedProps"
    :class="cn('bg-border -mx-1 my-1 h-px', props.class)"
  />
</template>
