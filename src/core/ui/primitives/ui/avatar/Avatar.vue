<script setup lang="ts">
import type { AvatarVariants } from './avatar';

import { AvatarRoot } from 'reka-ui';

import { cn } from '#/core/shared/utils';

import { avatarVariant } from './avatar';

const props = withDefaults(
  defineProps<{
    class?: any;
    shape?: AvatarVariants['shape'];
    size?: AvatarVariants['size'];
  }>(),
  {
    shape: 'circle',
    size: 'sm',
  },
);
</script>

<template>
  <AvatarRoot :class="cn(avatarVariant({ size, shape }), props.class)">
    <slot></slot>
  </AvatarRoot>
</template>
