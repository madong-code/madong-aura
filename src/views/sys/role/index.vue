<template>
  <div class="user-page art-full-height">
    <BasicTable />
  </div>
</template>
<script setup lang="tsx">
  import { useTable } from '@/components/table'
  import { tableSchema } from './schemas'
  const [BasicTable] = useTable({
    ...tableSchema,
    columns: tableSchema.columns,
    // hasAdd: true,
    // 左侧工具栏
    toolbarActions: [],
    // 左侧栏工具-下拉菜单
    dropDownToolbarActions: [],
    // 表格行操作
    tableActions: [],
    // 表格行操作-下拉菜单
    dropDownActions: []
  })
</script>
<style lang="scss" scoped></style>
