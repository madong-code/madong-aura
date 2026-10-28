<template>
  <ElConfigProvider
    size="default"
    :locale="locales[language]"
    :z-index="3000"
    :card="{
      shadow: 'never'
    }"
  >
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
  import { useUserStore } from './store/modules/user'
  import { useSiteConfigStore } from '#/store/modules/site-config'
  import { useAccessStore } from '#/core/stores'
  import zh from 'element-plus/es/locale/lang/zh-cn'
  import en from 'element-plus/es/locale/lang/en'
  import { systemUpgrade } from '#/core/utils/upgrade'
  import { toggleTransition } from '#/core/utils/ui/animation'
  import { checkStorageCompatibility } from '#/core/utils/storage'
  import { initializeTheme } from '#/core/composables/use-theme'

  const userStore = useUserStore()
  const { language } = storeToRefs(userStore)

  const locales = {
    zh: zh,
    en: en
  }

  onBeforeMount(() => {
    toggleTransition(true)
    initializeTheme()
  })

  onMounted(() => {
    checkStorageCompatibility()
    toggleTransition(false)
    systemUpgrade()
    // madong 站点配置（logo/标题/favicon/CDN）：GET /system/config/code/site_setting
    // 为匿名接口（后端 AllowAnonymous），登录前（登录页品牌）与登录后共用。
    // 已登录：强制刷新（拿到最新配置）；未登录：幂等预加载（main.ts 已提前发起，此处在途则跳过）。
    if (useAccessStore().accessToken) {
      useSiteConfigStore()
        .syncSitePreferences()
        .catch(() => {})
    } else {
      useSiteConfigStore()
        .fetchSiteConfig()
        .catch(() => {})
    }
  })

  // 站点配置变化 → 同步标签页标题与 favicon（对齐 admin app.vue）
  watch(
    () => useSiteConfigStore().getCurrentConfig(),
    (config) => {
      if (config?.title) {
        document.title = config.title
      }
      if (config?.favicon) {
        const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
        if (link) {
          link.href = config.favicon
        }
      }
    },
    { immediate: true }
  )
</script>
