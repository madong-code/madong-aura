<template>
  <ApiSelect :label-field="labelField" :value-field="valueField" :children-field="childrenField" />
</template>
<script lang="ts" setup>
  import ApiSelect from './api-select.vue'
  withDefaults(
    defineProps<{
      labelField?: string
      valueField?: string
      childrenField?: string
    }>(),
    {
      labelField: 'name',
      valueField: 'id',
      childrenField: 'children'
    }
  )
</script>
