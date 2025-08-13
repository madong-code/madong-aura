<template>
  <ApiComponent
    v-model="value"
    :component="ElTreeSelect"
    options-prop-name="data"
    :value-field="valueField"
    :label-field="labelField"
    :children-field="childrenField"
  />
</template>
<script setup lang="ts">
  import ApiComponent from '../api-component.vue'
  import { ElTreeSelect } from 'element-plus'
  const props = withDefaults(
    defineProps<{
      value?: string | undefined | number | null | Array<string | number>
      valueField?: string
      labelField?: string
      childrenField?: string
    }>(),
    {
      valueField: 'id',
      labelField: 'name',
      childrenField: 'children'
    }
  )

  const emit = defineEmits<{
    (e: 'update:value', value: string | undefined | number | null | Array<string | number>): void
  }>()

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
