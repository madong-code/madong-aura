<script setup lang="ts">
import type { PaginationPrevProps } from 'reka-ui';

import { computed } from 'vue';

import { ChevronLeft } from 'lucide-vue-next';
import { PaginationPrev } from 'reka-ui';

import { cn } from '#/core/shared/utils';

import { Button } from '../button';

const props = withDefaults(
  defineProps<PaginationPrevProps & { class?: any }>(),
  {
    asChild: true,
  },
);

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <PaginationPrev v-bind="delegatedProps">
    <Button :class="cn('size-8 p-0', props.class)" variant="outline">
      <slot>
        <ChevronLeft class="size-4" />
      </slot>
    </Button>
  </PaginationPrev>
</template>
