<script setup lang="ts">
import { ElCard } from 'element-plus';

import { Page } from '#/components/page';

/** 模块市场页面入口 */
import { MarketRouter } from './components';

defineOptions({ name: 'AppPluginMarket' });
</script>

<template>
  <Page auto-content-height>
    <ElCard class="h-full flex flex-col">
      <MarketRouter />
    </ElCard>
  </Page>
</template>
