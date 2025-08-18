<template>
  <div class="user-page art-full-height">
    <el-button @click="handleClick">隐藏搜索表单</el-button>
    <BasicTable />
  </div>
</template>
<script setup lang="ts">
  import { useTable } from '@/components/table'
  import { tableSchema } from './schemas'
  const [BasicTable, tableApi] = useTable({
    ...tableSchema
  })
  let flag = true
  const handleClick = () => {
    console.log('flag:', flag)
    tableApi
      .setState({
        useSearchForm: !flag
      })
      .then(() => {
        flag = false
      })
  }
</script>
<style lang="scss" scoped></style>
