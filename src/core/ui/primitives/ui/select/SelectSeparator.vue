<script setup lang="ts">
import type { SelectSeparatorProps } from 'reka-ui';

import { computed } from 'vue';

import { SelectSeparator } from 'reka-ui';

import { cn } from '#/core/shared/utils';

const props = defineProps<SelectSeparatorProps & { class?: any }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <SelectSeparator
    v-bind="delegatedProps"
    :class="cn('bg-muted -mx-1 my-1 h-px', props.class)"
  />
</template>
