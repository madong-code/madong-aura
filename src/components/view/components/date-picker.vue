<template>
  <span>{{ mValue }}</span>
</template>
<script setup lang="ts">
  import { PropType } from 'vue'
  defineOptions({
    inheritAttrs: false
  })
  const props = defineProps({
    value: {
      type: Object as PropType<any>
    },
    record: {
      // 当前行数据
      type: Object
    },
    separator: {
      // 分隔符
      type: String,
      default: ' ~ '
    }
  })
  const mValue = computed(() => {
    if (Array.isArray(props.value)) {
      return props.value.join(props.separator)
    }
    return props.value
  })
</script>

<style lang="scss" scoped></style>
