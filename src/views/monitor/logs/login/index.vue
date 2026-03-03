<template>
  <div class="logs-login-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'

  const [BasicCrud] = useCrud({
    ...crudSchema(),
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
