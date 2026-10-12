<!-- 全局组件 -->
<template>
  <component
    v-for="componentConfig in enabledComponents"
    :key="componentConfig.key"
    :is="componentConfig.component"
  />

  <!-- 回到顶部（常驻全局，内部按滚动距离自显隐） -->
  <AppBackToTop />
</template>

<script setup lang="ts">
  import { getEnabledGlobalComponents } from '#/core/config/modules/component'
  defineOptions({ name: 'AppGlobalLayer' })
  const enabledComponents = computed(() => getEnabledGlobalComponents())
</script>
