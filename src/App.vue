<template>
  <ElConfigProvider
    size="default"
    :locale="elementLocale"
    :z-index="3000"
    :card="{
      shadow: 'never'
    }"
  >
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
  /**
   * 根组件
   *
   * Element Plus 的语言包由 `#/locales` 统一维护（与 vue-i18n 同源），
   * 不再使用 art 原来的 userStore.language 手动映射，避免两套语言状态不同步。
   */
  import { elementLocale } from '#/locales'
  import { systemUpgrade } from '#/core/shared/art-utils/sys'
  import { toggleTransition } from '#/core/shared/art-utils/ui/animation'
  import { checkStorageCompatibility } from '#/core/shared/art-utils/storage'
  import { initializeTheme } from '#/core/composables/art/useTheme'

  onBeforeMount(() => {
    toggleTransition(true)
    initializeTheme()
  })

  onMounted(() => {
    checkStorageCompatibility()
    toggleTransition(false)
    systemUpgrade()
  })
</script>
