<template>
  <i class="iconfont-sys" v-if="iconType === 'unicode'" v-html="icon"></i>
  <i :class="`iconfont-sys ${icon}`" v-else></i>
</template>
<script setup lang="ts">
  const props = defineProps({
    icon: {
      type: String
    }
  })
  const iconType = computed(() => {
    if (props.icon?.startsWith('iconsys-')) {
      return 'class'
    }
    return 'unicode'
  })
</script>
<style lang="scss" scoped></style>
