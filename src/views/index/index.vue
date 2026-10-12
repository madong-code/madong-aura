<!-- 布局容器 -->
<template>
  <div class="app-layout">
    <aside id="app-sidebar">
      <AppSidebarMenu />
    </aside>

    <main id="app-main">
      <div id="app-header">
        <AppHeaderBar />
      </div>
      <div id="app-content">
        <AppLayoutContent />
      </div>
    </main>

    <div id="app-global">
      <AppGlobalLayer />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'AppLayout' })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
