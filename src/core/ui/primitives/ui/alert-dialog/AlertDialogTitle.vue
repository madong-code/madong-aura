<script setup lang="ts">
import type { AlertDialogTitleProps } from 'reka-ui';

import { computed } from 'vue';

import { AlertDialogTitle, useForwardProps } from 'reka-ui';

import { cn } from '#/core/shared/utils';

const props = defineProps<AlertDialogTitleProps & { class?: any }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <AlertDialogTitle
    v-bind="forwardedProps"
    :class="
      cn('text-lg leading-none font-semibold tracking-tight', props.class)
    "
  >
    <slot></slot>
  </AlertDialogTitle>
</template>
