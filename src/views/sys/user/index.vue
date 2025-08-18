<template>
  <div class="user-page art-full-height">
    <!-- <el-button @click="handleClick">刷新</el-button> -->
    <BasicTable />
  </div>
</template>
<script setup lang="ts">
  import { useTable } from '@/components/table'
  import { tableSchema } from './schemas'
  const [BasicTable] = useTable({
    ...tableSchema
  })
  // const handleClick = () => {
  //   tableApi.reload()
  // }
</script>
<style lang="scss" scoped></style>
