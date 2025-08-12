<template>
  <ElSelectV2 v-model="value" :options="options">
    <template v-for="(_, slotName) in slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </ElSelectV2>
</template>
<script setup lang="ts">
  import { useSlots, computed } from 'vue'
  import { ElSelectV2 } from 'element-plus'
  import { NewOption } from '@/types/component/dict'
  const props = defineProps<{
    value?: string | undefined | number | null | Array<string | number>
    options: Array<NewOption>
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

  // 使用 useSlots 获取所有插槽
  const slots = useSlots()
  defineExpose({
    getValue() {
      return value.value
    }
  })
</script>
<style lang="scss" scoped></style>
