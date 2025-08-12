<template>
  <ElCheckboxGroup v-model="value">
    <template v-if="isBtn">
      <ElCheckboxButton
        :size="size"
        v-for="item in options"
        :key="item.value + ''"
        :value="item.value"
        >{{ item.label }}</ElCheckboxButton
      >
    </template>
    <template v-else>
      <ElCheckbox :size="size" v-for="item in options" :key="item.value + ''" :value="item.value">{{
        item.label
      }}</ElCheckbox>
    </template>
  </ElCheckboxGroup>
</template>
<script setup lang="ts">
  import { ElCheckboxButton } from 'element-plus'
  import { computed } from 'vue'
  const props = defineProps<{
    value: Array<string | number>
    options: Array<{ label: string; value: string | number }>
    isBtn?: boolean
    size?: 'default' | 'small' | 'large' | undefined
  }>()

  const emit = defineEmits<{
    (e: 'update:value', value: Array<string | number>): void
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
