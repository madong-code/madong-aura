<script setup lang="ts">
import type { DropdownMenuItemProps } from 'reka-ui';

import { computed } from 'vue';

import { DropdownMenuItem, useForwardProps } from 'reka-ui';

import { cn } from '#/core/shared/utils';

const props = defineProps<
  DropdownMenuItemProps & { class?: any; inset?: boolean }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuItem
    v-bind="forwardedProps"
    :class="
      cn(
        'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        props.class,
      )
    "
  >
    <slot></slot>
  </DropdownMenuItem>
</template>
