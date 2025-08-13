<template>
  <ElInputNumber v-model="value">
    <template v-for="(_, slotName) in slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </ElInputNumber>
</template>

<script setup lang="ts">
  import { useSlots, computed } from 'vue'

  const props = defineProps<{
    value: number | undefined
  }>()

  const emit = defineEmits<{
    (e: 'update:value', value: number | undefined): void
  }>()

  const value = computed({
    get() {
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
