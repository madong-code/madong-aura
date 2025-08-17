<template>
  <span>{{ displayValue }}</span>
</template>
<script setup lang="ts">
  import { computed } from 'vue'
  import { NewOption } from '@/types/component/dict'
  const props = withDefaults(
    defineProps<{
      value?: string | undefined | number | null | Array<string | number>
      options?: Array<NewOption>
      valueField?: string
      labelField?: string
      childrenField?: string
      multiple?: boolean
    }>(),
    {
      valueField: 'id',
      labelField: 'name',
      childrenField: 'children'
    }
  )

  // 递归查找选项（支持树形结构）
  const findOption = (value: string | number, options: NewOption[]): NewOption | undefined => {
    for (const option of options) {
      if (option.value === value) {
        return option
      }
      if (option.children && option.children.length > 0) {
        const found = findOption(value, option.children)
        if (found) {
          return found
        }
      }
    }
    return undefined
  }

  const displayValue = computed(() => {
    // 如果没有选项或值为空，直接返回值
    if (
      !props.options ||
      !props.options.length ||
      props.value === undefined ||
      props.value === null
    ) {
      return props.value
    }
    let values = props.value
    // 处理multiple模式下字符串值需要分割的情况
    if (props.multiple && typeof values === 'string') {
      values = values.split(',')
    }
    // 处理数组值（多选情况）
    if (Array.isArray(values)) {
      const labels = values.map((val) => {
        const option = findOption(val, props.options!)
        return option ? option.label : val
      })
      return labels.join(', ')
    }

    // 处理单个值
    const option = findOption(values, props.options)
    return option ? option.label : props.value
  })
</script>
<style lang="scss" scoped></style>
