<template>
  <div class="sys-config-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'

  const [BasicCrud] = useCrud({
    ...crudSchema,
    toolbarActions: [],
    dropDownToolbarActions: [],
    tableActions: [],
    dropDownActions: []
  })
</script>
<style lang="scss" scoped></style>
