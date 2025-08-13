<template>
  <ArtSearchDate v-model:value="value" :item="item" />
</template>
<script setup lang="ts">
  import ArtSearchDate, {
    type ValueVO
  } from '@/components/core/forms/art-search-bar/widget/art-search-date/index.vue'
  // 日期选择器类型
  type DatePickerType =
    | 'date' // 单日期
    | 'datetime' // 日期时间
    | 'daterange' // 日期范围
    | 'datetimerange' // 日期时间范围
    | 'month' // 月份
    | 'monthrange' // 月份范围
    | 'year' // 年份
    | 'yearrange' // 年份范围
    | 'week' // 周
  const props = defineProps<{
    value: ValueVO
    type?: DatePickerType
  }>()
  const attrs = useAttrs()
  const emit = defineEmits<{
    (e: 'update:value', value: ValueVO): void
  }>()
  const item: any = {
    label: attrs.label || '日期',
    prop: props.type || 'date',
    type: props.type || 'date',
    config: {
      ...props,
      ...attrs
    }
  }
  const value = computed({
    get() {
      return props.value
    },
    set(val) {
      emit('update:value', val)
    }
  })

  defineExpose({
    getValue() {
      return value.value
    }
  })
</script>
<style lang="scss" scoped></style>
