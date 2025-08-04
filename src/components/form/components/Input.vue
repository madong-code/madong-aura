<template>
  <ElInput v-model="value" />
</template>
<script setup lang="ts">
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
</script>
<style lang="less" scoped></style>
