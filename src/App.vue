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
    // madong 站点配置（logo/标题/favicon）：接口需要登录态，仅在已登录启动时预加载；
    // 未登录访问登录页不拉取（401 会触发重认证流程），登录成功后由登录流程负责同步
    if (useAccessStore().accessToken) {
      useSiteConfigStore()
        .syncSitePreferences()
        .catch(() => {})
    }
  })
</script>
