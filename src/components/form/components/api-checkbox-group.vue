<template>
  <ApiComponent v-model="value" model-prop-name="value" :component="CheckboxGroup" />
</template>
<script setup lang="ts">
  import ApiComponent from '../api-component.vue'
  import { computed } from 'vue'
  import CheckboxGroup from './checkbox-group.vue'
  const props = defineProps<{
    value?: Array<string | number> | undefined
    isBtn?: boolean
    size?: 'default' | 'small' | 'large' | undefined
  }>()

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
