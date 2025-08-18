<template>
  <div class="user-page art-full-height">
    <BasicTable />
  </div>
</template>
<script setup lang="ts">
  import { useTable } from '@/components/table'
  const [BasicTable] = useTable({
    columns: []
  })
</script>
<style lang="scss" scoped></style>
