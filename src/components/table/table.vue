<template>
  <SearchBar v-if="tableSchemaRef.searchFormSchema" @reset="handleReset" @submit="handleSearch" />
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
  import { useSearchBar } from '@/components/search-bar'
  import { TableSchema } from './types'
  import { viewColumnFormatter } from '../view/component-map'
  import request from '@/utils/http'
  defineOptions({
    inheritAttrs: false
  })
  const props = withDefaults(
    defineProps<{
      tableSchema: TableSchema
      tableMethods?: any
    }>(),
    {
      tableSchema: () => {
        return {
          columns: [],
          api: '',
          useSearchForm: true,
          searchFormSchema: {
            schema: []
          }
        }
      }
    }
  )
  const emit = defineEmits<{
    (e: 'submit', values: any): void
    (e: 'reset'): void
  }>()
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
  const [SearchBar] = useSearchBar(tableSchemaRef.value.searchFormSchema || {})
  const {
    data: tableData,
    columns,
    loading,
    pagination,
    getData,
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

  const handleSearch = (values: any) => {
    //Object.assign(searchParams, values)
    getData(values)
    emit('submit', values)
  }
  const handleReset = () => {
    //Object.assign(searchParams, {})
    getData({})
    emit('reset')
  }
</script>
<style lang="scss" scoped></style>
