<template>
  <ApiComponent v-model="value" model-prop-name="value" :component="RadioGroup" />
</template>
<script setup lang="ts">
  import ApiComponent from '../api-component.vue'
  import { computed } from 'vue'
  import RadioGroup from './radio-group.vue'
  const props = defineProps<{
    value?: string | number | boolean | undefined
    isBtn?: boolean
    size?: 'default' | 'small' | 'large' | undefined
  }>()

  const emit = defineEmits<{
    (e: 'update:value', value: string | number | boolean | undefined): void
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
