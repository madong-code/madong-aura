<script setup lang="ts">
import type { SelectLabelProps } from 'reka-ui';

import { SelectLabel } from 'reka-ui';

import { cn } from '#/core/shared/utils';

const props = defineProps<SelectLabelProps & { class?: any }>();
</script>

<template>
  <SelectLabel :class="cn('px-2 py-1.5 text-sm font-semibold', props.class)">
    <slot></slot>
  </SelectLabel>
</template>
