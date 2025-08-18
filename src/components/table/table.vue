<template>
  <!-- 表格 -->
  <ArtTable
    rowKey="id"
    :loading="loading"
    :data="tableData"
    :columns="columns"
    :pagination="pagination"
    @pagination:size-change="handleSizeChange"
    @pagination:current-change="handleCurrentChange"
  >
  </ArtTable>
</template>
<script setup lang="ts">
  import { UserService } from '@/api/usersApi'
  import { useTable } from '@/composables/useTable'
  import { TableSchema } from './types'
  import { viewColumnFormatter } from '../view/component-map'
  const props = withDefaults(
    defineProps<{
      tableSchema: TableSchema
      tableMethods?: any
    }>(),
    {
      tableSchema: () => {
        return {
          columns: []
        }
      }
    }
  )
  const tableSchemaRef = ref(props.tableSchema)
  const {
    data: tableData,
    columns,
    loading,
    pagination,
    handleSizeChange,
    handleCurrentChange
  } = useTable<any>({
    core: {
      apiFn: UserService.getUserList,
      apiParams: {
        // 其他搜索参数
      },
      columnsFactory: () => {
        return tableSchemaRef.value.columns.map((column) => {
          const c = { ...column }
          viewColumnFormatter(column)
          c.formatter = column.formatter
          delete c.component
          delete c.componentProps
          return c
        })
      }
    }
  })
</script>
<style lang="scss" scoped></style>
