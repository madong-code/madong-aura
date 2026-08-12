<!-- 404 页面（样式与 art-design-pro 原版一致） -->
<template>
  <ArtException
    :data="{
      title: '404',
      desc: $t('exception-page.404'),
      btnText: $t('exception-page.gohome'),
      imgUrl
    }"
  />
</template>

<script setup lang="ts">
  import imgUrl from '@imgs/svg/404.svg'
  defineOptions({ name: 'Exception404Page' })
</script>
