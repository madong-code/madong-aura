<script setup lang="ts">
import type { CustomRenderType } from '../types';

import { HelpCircle } from 'lucide-vue-next';

import { cn } from '#/core/shared/utils';
import { FormLabel, VbenRenderContent } from '#/core/ui/primitives';

interface Props {
  class?: string;
  colon?: boolean;
  help?: CustomRenderType;
  label?: CustomRenderType;
  required?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <FormLabel :class="cn('flex items-center', props.class)">
    <span v-if="required" class="mr-0.5 text-destructive">*</span>
    <slot></slot>
    <el-tooltip
      v-if="help"
      :content="typeof help === 'string' ? help : ''"
      placement="right"
      :show-after="150"
    >
      <HelpCircle
        class="text-foreground/80 hover:text-foreground inline-flex cursor-pointer size-3.5 ml-1"
      />
      <template #content v-if="typeof help !== 'string'">
        <VbenRenderContent :content="help" />
      </template>
    </el-tooltip>
    <slot name="extra"></slot>
    <span v-if="colon && label" class="ml-0.5">:</span>
  </FormLabel>
</template>
