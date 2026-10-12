<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { requestClient } from '#/api/request';

import SaaSDelegation from './SaaSDelegation.vue';
import StandaloneDelegation from './StandaloneDelegation.vue';

defineOptions({ name: 'AppPluginDelegation' });

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
  <div v-loading="loading" class="h-full p-5">
    <SaaSDelegation v-if="isSaasMode" />
    <StandaloneDelegation v-else-if="!loading" />
  </div>
</template>
