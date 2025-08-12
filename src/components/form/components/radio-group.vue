<template>
  <ElRadioGroup v-model="value">
    <template v-if="isBtn">
      <ElRadioButton
        :size="size"
        v-for="item in options"
        :key="item.value + ''"
        :value="item.value"
        >{{ item.label }}</ElRadioButton
      >
    </template>
    <template v-else>
      <ElRadio :size="size" v-for="item in options" :key="item.value + ''" :value="item.value">{{
        item.label
      }}</ElRadio>
    </template>
  </ElRadioGroup>
</template>
<script setup lang="ts">
  import { NewOption } from '@/types/component/dict'
  import { computed } from 'vue'
  const props = defineProps<{
    value?: string | number | boolean | undefined
    options: Array<NewOption>
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
