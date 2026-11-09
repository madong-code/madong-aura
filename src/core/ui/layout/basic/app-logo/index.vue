<!-- 系统logo -->
<template>
  <div class="flex-cc">
    <img v-if="logoSrc" :style="logoStyle" :src="logoSrc" alt="logo" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
  import { preferences } from '#/core/preferences'
  import { useSiteConfigStore } from '#/store/modules/site-config'
  import { buildStaticUrl } from '#/utils/url'
  import { isPrivateResourcePending, resolveSignedUrl } from '#/utils/url/private-storage'

  defineOptions({ name: 'AppLogo' })

  interface Props {
    /** logo 大小 */
    size?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 36
  })

  const siteConfigStore = useSiteConfigStore()

  /** 站点配置中的 Logo 原始资源 key（私有空间下不能直接拼域名访问） */
  const rawLogo = computed(() => String(siteConfigStore.getCurrentConfig()?.logo || '').trim())

  /**
   * 私有空间签名直链是否尚未就绪。
   * pending 时下游不会走到 buildStaticUrl，需在此主动触发换取
   * （内部已有缓存、节流与去重；启动阶段预热过则直接命中缓存）
   */
  const logoPending = computed(() => {
    if (rawLogo.value === '') return false
    resolveSignedUrl(rawLogo.value)
    return isPrivateResourcePending(rawLogo.value)
  })

  /**
   * 统一走 buildStaticUrl：私有签名直链 / CDN 域名 / 同域相对路径。
   * 依赖 signedUrls 响应式缓存，签名稍后到达或刷新后会自动重算，
   * 避免 preferences.logo.source 一次性写入后破图无法自愈；
   * 签名未就绪时不渲染图片（保留站名占位），不产生裸链 403 请求。
   */
  const logoSrc = computed(() => {
    const raw = rawLogo.value
    if (raw === '') return preferences.logo?.source || '/logo.png'
    if (logoPending.value) return ''
    return buildStaticUrl(raw)
  })

  const logoStyle = computed(() => ({ width: `${props.size}px` }))
</script>
