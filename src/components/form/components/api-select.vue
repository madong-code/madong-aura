<template>
  <ApiComponent v-model="value" :component="ElSelectV2" />
</template>
<script setup lang="ts">
  import ApiComponent from '../api-component.vue'
  import { ElSelectV2 } from 'element-plus'
  const props = defineProps<{
    value?: string | undefined | number | null | Array<string | number>
  }>()

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
