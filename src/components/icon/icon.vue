<template>
  <i class="iconfont-sys" v-if="iconType === 'unicode'" v-html="icon"></i>
  <i :class="`iconfont-sys ${icon}`" v-else-if="iconType === 'className'"></i>
  <ElIcon class="m-icon" v-else-if="typeof icon === 'string'">
    <Icon :icon="icon" :width="width" :height="height" :color="color"></Icon>
  </ElIcon>
  <ElIcon class="m-icon" v-else-if="typeof icon === 'object'"
    ><component :is="icon" :width="width" :height="height" :color="color"></component
  ></ElIcon>
</template>
<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { VNode } from 'vue'
  import { ElIcon } from 'element-plus'
  const props = defineProps({
    icon: {
      type: [String, Object] as PropType<string | VNode>
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
    if (props.icon?.toString().startsWith('iconsys-')) {
      return 'className'
    } else if (props.icon?.toString().includes(':')) {
      return 'iconify'
    }
    return 'unicode'
  })
</script>
<style lang="scss" scoped>
  .m-icon {
    width: auto !important;
  }
</style>
