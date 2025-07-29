<template>
  <span>{{ cValue }}</span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { NewOption } from '@/types/component/dict'
  import { PropType } from 'vue'

  const props = defineProps({
    value: {
      type: [String, Number, Array]
    },
    options: {
      type: Array as PropType<NewOption[]>,
      default: () => []
    }
  })

  // 实现cValue的转换逻辑
  const cValue = computed(() => {
    // 处理空值情况
    if (props.value === null || props.value === undefined || props.value === '') {
      return ''
    }

    // 处理数组情况（多选）
    if (Array.isArray(props.value)) {
      return props.value
        .map((val) => {
          const option = props.options.find((opt) => opt.value === val)
          return option ? option.label : val
        })
        .join(', ')
    }

    // 处理单值情况
    const option = props.options.find((opt) => opt.value === props.value)
    return option ? option.label : props.value
  })
</script>

<style lang="less" scoped></style>
