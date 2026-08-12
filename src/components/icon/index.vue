<script setup lang="ts">
import { ElIcon } from 'element-plus';

import { IconifyIcon as VbenIcon } from '#/core/design/icons';

const props = defineProps({
  icon: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <ElIcon>
    <VbenIcon :icon="props.icon" />
  </ElIcon>
</template>
