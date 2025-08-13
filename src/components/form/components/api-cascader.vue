<template>
  <ApiComponent
    v-model="value"
    :component="ElCascader"
    :value-field="valueField"
    :label-field="labelField"
    :children-field="childrenField"
    style="width: 100%"
  />
</template>
<script setup lang="ts">
  import ApiComponent from '../api-component.vue'
  import { computed } from 'vue'
  import { ElCascader } from 'element-plus'
  const props = withDefaults(
    defineProps<{
      value?: Array<string | number>
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
    (e: 'update:value', value: Array<string | number> | undefined): void
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
