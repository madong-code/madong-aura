<template>
  <i class="iconfont-sys" v-if="iconType === 'unicode'" v-html="icon"></i>
  <i :class="`iconfont-sys ${icon}`" v-else-if="iconType === 'className'"></i>
  <Icon v-else-if="icon" :icon="icon" :width="width" :height="height" :color="color"></Icon>
</template>
<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  const props = defineProps({
    icon: {
      type: String
    },
    width: {
      type: [String, Number],
      default: '1em'
    },
    height: {
      type: [String, Number],
      default: '1em'
    },
    color: {
      type: String,
      default: undefined
    }
  })
  const iconType = computed(() => {
    if (props.icon?.startsWith('iconsys-')) {
      return 'className'
    } else if (props.icon?.includes(':')) {
      return 'iconify'
    }
    return 'unicode'
  })
</script>
<style lang="scss" scoped></style>
