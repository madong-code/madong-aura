<!-- 系统logo -->
<template>
  <div class="art-logo">
    <img :style="logoStyle" :src="logo" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ArtLogo' })
  import { useSystemConfigStore } from '@/store/modules/system-config'
  const systemConfigStore = useSystemConfigStore()
  interface Props {
    /** logo 大小 */
    size?: number | string
  }
  import defaultLogo from '@imgs/common/logo.webp'
  const props = withDefaults(defineProps<Props>(), {
    size: 36
  })
  const systemInfo = computed(() => systemConfigStore.config)
  const logo = computed(() => systemInfo.value.logo || defaultLogo)
  const logoStyle = computed(() => ({ width: `${props.size}px` }))
</script>
