<!-- 500 服务器错误页面（样式与 art-design-pro 原版一致） -->
<template>
  <ArtException
    :data="{
      title: '500',
      desc: $t('exception-page.500'),
      btnText: $t('exception-page.gohome'),
      imgUrl
    }"
  />
</template>

<script setup lang="ts">
  import imgUrl from '@imgs/svg/500.svg'
  defineOptions({ name: 'Exception500' })
</script>
