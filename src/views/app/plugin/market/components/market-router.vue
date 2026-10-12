<script setup lang="ts">
/** 模块市场路由：按站点模式分发 授权市场 或 独立市场 页面 */
import { computed, onMounted, ref } from 'vue';

import { requestClient } from '#/api/request';


import StandaloneModuleMarket from './standalone/standalone-module-market.vue';

defineOptions({ name: 'MarketRouter' });

const mode = ref<string>('standalone');
const loading = ref(true);

onMounted(async () => {
  try {
    const res: any = await requestClient.get('/site/mode');
    mode.value = res?.mode || 'standalone';
  } catch {
    mode.value = 'standalone';
  } finally {
    loading.value = false;
  }
});

const isSaasMode = computed(() => mode.value === 'saas');
</script>

<template>
  <div v-loading="loading" class="h-full flex flex-col">
    <StandaloneModuleMarket v-if="!loading" class="flex-1" />
  </div>
</template>
