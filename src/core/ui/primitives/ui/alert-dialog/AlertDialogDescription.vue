<script lang="ts" setup>
import type { AlertDialogDescriptionProps } from 'reka-ui';

import { computed } from 'vue';

import { AlertDialogDescription, useForwardProps } from 'reka-ui';

import { cn } from '#/core/shared/utils';

const props = defineProps<AlertDialogDescriptionProps & { class?: any }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <AlertDialogDescription
    v-bind="forwardedProps"
    :class="cn('text-muted-foreground text-sm', props.class)"
  >
    <slot></slot>
  </AlertDialogDescription>
</template>
