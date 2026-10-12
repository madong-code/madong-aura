<!-- 系统logo -->
<template>
  <div class="flex-cc">
    <img :style="logoStyle" :src="logoSrc" alt="logo" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
  import { preferences } from '#/core/preferences'

  defineOptions({ name: 'AppLogo' })

  interface Props {
    /** logo 大小 */
    size?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 36
  })

  /**
   * 远程站点配置 logo 优先（site-config applyToPreferences 写入 preferences.logo.source），
   * 后端未配置时回退本地默认（public/logo.png）
   */
  const logoSrc = computed(() => preferences.logo?.source || '/logo.png')

  const logoStyle = computed(() => ({ width: `${props.size}px` }))
</script>
