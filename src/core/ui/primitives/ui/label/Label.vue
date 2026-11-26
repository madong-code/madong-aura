<script setup lang="ts">
import type { LabelProps } from 'reka-ui';

import { computed } from 'vue';

import { Label } from 'reka-ui';

import { cn } from '#/core/shared/utils';

const props = defineProps<LabelProps & { class?: any }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <Label
    v-bind="delegatedProps"
    :class="
      cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class,
      )
    "
  >
    <slot></slot>
  </Label>
</template>
