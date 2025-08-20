<template>
  <ElInputNumber v-model="value">
    <template v-for="(_, slotName) in slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </ElInputNumber>
</template>

<script setup lang="ts">
  import { isString } from 'lodash-es'
  import { useSlots, computed } from 'vue'

  const props = defineProps<{
    value: number | undefined | string
  }>()

  const emit = defineEmits<{
    (e: 'update:value', value: number | undefined): void
  }>()

  const value = computed({
    get() {
      if (isString(props.value)) {
        return Number(props.value)
      }
      return props.value
    },
    set(val) {
      emit('update:value', val)
    }
  })

  // 使用 useSlots 获取所有插槽
  const slots = useSlots()
  defineExpose({
    getValue() {
      return value.value
    }
  })
</script>
<style lang="scss" scoped></style>
