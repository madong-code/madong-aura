<script setup lang="ts">
/** SaaS 版授权信息：提示由平台端管理 */
defineOptions({ name: 'SaaSDelegation' });
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 text-gray-400">
    <span class="text-6xl">🔑</span>
    <h3 class="mt-4 text-lg font-medium text-gray-600">授权管理</h3>
    <p class="mt-2 text-sm">
      授权信息由平台端统一管理，如需配置请联系平台管理员
    </p>
  </div>
</template>
