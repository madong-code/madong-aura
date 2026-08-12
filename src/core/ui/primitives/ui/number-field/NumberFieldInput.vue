<script setup lang="ts">
import { NumberFieldInput } from 'reka-ui';

import { cn } from '#/core/shared/utils';
</script>

<template>
  <NumberFieldInput
    :class="
      cn(
        'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent py-1 text-center text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
      )
    "
    data-slot="input"
  />
</template>
