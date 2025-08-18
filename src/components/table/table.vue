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
  import { useTable } from '@/composables/useTable'
  import { TableSchema } from './types'
  import { viewColumnFormatter } from '../view/component-map'
  import request from '@/utils/http'
  const props = withDefaults(
    defineProps<{
      tableSchema: TableSchema
      tableMethods?: any
    }>(),
    {
      tableSchema: () => {
        return {
          columns: [],
          api: ''
        }
      }
    }
  )
  const tableSchemaRef = ref(props.tableSchema)
  const funApi = computed(() => {
    if (props.tableSchema.api && typeof props.tableSchema.api === 'string') {
      const fun = (params: any) => {
        return request[props.tableSchema.requestMethod ?? 'post']({
          url: props.tableSchema.api as string,
          params
        })
      }
      return fun
    }
    return props.tableSchema.api as any
  })
  const {
    data: tableData,
    columns,
    loading,
    pagination,
    handleSizeChange,
    handleCurrentChange
  } = useTable<any>({
    core: {
      apiFn: funApi.value,
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
