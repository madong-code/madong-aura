<template>
  <ElInput v-model="value">
    <template v-for="(_, slotName) in slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </ElInput>
</template>

<script setup lang="ts">
  import { useSlots, computed } from 'vue'

  const props = defineProps<{
    value: string
  }>()

  const emit = defineEmits<{
    (e: 'update:value', value: string): void
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
</script>
<style lang="scss" scoped></style>
