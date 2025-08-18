<template>
  <div class="user-page art-full-height">
    <BasicTable />
  </div>
</template>
<script setup lang="ts">
  import { useTable } from '@/components/table'
  import { tableSchema } from './schemas'
  const [BasicTable] = useTable({
    ...tableSchema
  })
</script>
<style lang="scss" scoped></style>
