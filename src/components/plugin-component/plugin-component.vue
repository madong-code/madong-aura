<script setup lang="ts">
import type { Component } from 'vue';

import { computed, onBeforeUnmount, onMounted, useAttrs } from 'vue';

import { mergePluginConfig } from './merge-config';
import type {
  PluginComponentConfig,
  PluginLifecycleHooks,
} from './types';

/**
 * 通用插件组件包装器（标准化包装器模式核心层）。
 *
 * 三项职责（仅此三项，不侵入插件业务逻辑）：
 * 1. 配置注入：config 与 configDefaults 合并后连同 attrs 一次性 v-bind 透传，
 *    插件组件按原生 props 声明即可消费，无需编写配置接收 / 解析逻辑；
 * 2. 生命周期绑定：插件在配置中声明 lifecycle 钩子，挂载 / 卸载由包装器统一执行；
 * 3. 透传适配：非配置 props（含事件）经 attrs 原样透传，插槽原样透传。
 */
const props = defineProps<{
  /** 插件内部组件（业务实现），包装器不感知其内部结构 */
  component: Component;
  /** 实例配置：来自 componentProps.config 的整体注入，优先级高于 configDefaults */
  config?: PluginComponentConfig;
  /** 默认配置：工厂 / 包装器侧声明的基础配置 */
  configDefaults?: PluginComponentConfig;
  /** 生命周期钩子：由包装器统一绑定执行 */
  lifecycle?: PluginLifecycleHooks;
}>();

const attrs = useAttrs();

/** 合并后的最终配置：defaults < 实例 config（深合并，实例字段优先） */
const mergedConfig = computed<PluginComponentConfig>(() =>
  mergePluginConfig(props.configDefaults, props.config),
);

onMounted(() => {
  props.lifecycle?.onMounted?.(mergedConfig.value);
});

onBeforeUnmount(() => {
  props.lifecycle?.onBeforeUnmount?.(mergedConfig.value);
});
</script>

<template>
  <component :is="props.component" v-bind="{ ...attrs, ...mergedConfig }">
    <template v-for="(_, name) in $slots" #[name]="scope" :key="name">
      <slot :name="name" v-bind="scope ?? {}"></slot>
    </template>
  </component>
</template>
