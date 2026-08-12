<script setup lang="ts">
import type { DropdownMenuLabelProps } from 'reka-ui';

import { computed } from 'vue';

import { DropdownMenuLabel, useForwardProps } from 'reka-ui';

import { cn } from '#/core/shared/utils';

const props = defineProps<
  DropdownMenuLabelProps & { class?: any; inset?: boolean }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuLabel
    v-bind="forwardedProps"
    :class="
      cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', props.class)
    "
  >
    <slot></slot>
  </DropdownMenuLabel>
</template>
