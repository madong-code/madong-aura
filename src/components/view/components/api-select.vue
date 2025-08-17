<template>
  <ApiComponent
    v-model="value"
    model-prop-name="value"
    :component="ApiView"
    :label-field="labelField"
    :value-field="valueField"
    :children-field="childrenField"
  />
</template>
<script setup lang="ts">
  import ApiComponent from '@/components/form/api-component.vue'
  import ApiView from '@/components/view/api-view.vue'
  const props = defineProps<{
    value?: string | undefined | number | null | Array<string | number>
    labelField?: string
    valueField?: string
    childrenField?: string
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
</script>
<style lang="scss" scoped></style>
