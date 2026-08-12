<script setup lang="ts">
import type { AccordionContentProps } from 'reka-ui';

import { computed } from 'vue';

import { AccordionContent } from 'reka-ui';

import { cn } from '#/core/shared/utils';

const props = defineProps<AccordionContentProps & { class?: any }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <AccordionContent
    v-bind="delegatedProps"
    class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
  >
    <div :class="cn('pt-0 pb-4', props.class)">
      <slot></slot>
    </div>
  </AccordionContent>
</template>
