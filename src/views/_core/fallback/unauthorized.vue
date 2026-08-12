<!-- 401 未授权页面（样式与 art-design-pro 原版一致） -->
<template>
  <ArtException
    :data="{
      title: '401',
      desc: $t('exception-page.401'),
      btnText: $t('exception-page.gohome'),
      imgUrl
    }"
  />
</template>

<script setup lang="ts">
  import imgUrl from '@imgs/svg/403.svg'
  defineOptions({ name: 'Exception401' })
</script>
