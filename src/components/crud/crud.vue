<template>
  <SearchBar
    v-if="crudSchemaRef.useSearchForm !== false"
    @reset="handleReset"
    @submit="handleSearch"
  />
  <ElCard class="art-table-card" shadow="never">
    <!-- 表格头部 -->
    <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
      <template #left>
        <slot name="toolbar-actions">
          <TableAction :actions="toolbarActions" :drop-down-actions="dropDownToolbarActions">
            <template #more>
              <ElButton>
                <template #icon
                  ><Icon class="icon-more" icon="ant-design:down-outlined"
                /></template>
                更多操作</ElButton
              >
            </template>
          </TableAction>
        </slot>
      </template>
      <template #right>
        <slot name="toolbar-tools"></slot>
      </template>
    </ArtTableHeader>
    <!-- 表格 -->
    <ArtTable
      :rowKey="crudSchemaRef.rowKey ?? 'id'"
      :loading="loading"
      :data="tableData"
      :columns="columns"
      :pagination="pagination"
      @pagination:size-change="handleSizeChange"
      @pagination:current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      :stripe="true"
      v-bind="{ ...$attrs }"
    >
      <template v-for="(_, slotName) in $slots" #[slotName]>
        <slot :name="slotName"></slot>
      </template>
    </ArtTable>
  </ElCard>
  <DialogForm
    v-bind="{ ...crudSchemaRef.dialogProps }"
    ref="dialogFormRef"
    :crud-schema="crudSchemaRef"
  />
</template>
<script setup lang="tsx">
  import { useTable } from '@/composables/useTable'
  import { useSearchBar } from '@/components/search-bar'
  import { CrudInstance, CrudReadonlyState, CrudSchema } from './types'
  import { viewColumnFormatter } from '../view/component-map'
  import request from '@/utils/http'
  import { TableAction } from '../table-action'
  import DialogForm from './dialog-form.vue'
  import { useAction } from './use-action'
  defineOptions({
    inheritAttrs: false
  })
  const props = withDefaults(
    defineProps<{
      crudSchema: CrudSchema
      crudMethods?: any
    }>(),
    {
      crudSchema: () => {
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
    (e: 'register', methods: CrudInstance): void
  }>()
  const crudSchemaRef = ref(props.crudSchema)
  const dialogFormRef = ref<any>(null)
  // 计算各种操作按钮配置
  const { toolbarActions, dropDownToolbarActions, tableActions, dropDownActions } = useAction(
    crudSchemaRef.value,
    dialogFormRef,
    props.crudMethods
  )

  const funApi = computed(() => {
    if (props.crudSchema.api && typeof props.crudSchema.api === 'string') {
      const fun = (params: any) => {
        return request[props.crudSchema.requestMethod ?? 'post']({
          url: props.crudSchema.api as string,
          params
        })
      }
      return fun
    }
    return props.crudSchema.api as any
  })
  const [SearchBar, searchBarApi] = useSearchBar(crudSchemaRef.value.searchFormSchema || {})
  const tableObject = useTable<any>({
    core: {
      apiFn: funApi.value,
      apiParams: {
        // 其他搜索参数
      },
      columnsFactory: () => {
        const columns = crudSchemaRef.value.columns.map((column) => {
          const c = { ...column }
          viewColumnFormatter(column)
          c.formatter = column.formatter
          delete c.component
          delete c.componentProps
          return c
        })
        // 有操作列配置才添加操作列
        if (
          (tableActions.value && tableActions.value.length > 0) ||
          (dropDownActions.value && dropDownActions.value.length > 0)
        ) {
          columns.push({
            prop: '__ACTION__',
            label: '操作',
            width: 150,
            align: 'center',
            fixed: 'right', // 固定列
            formatter: (row: unknown) => {
              return (
                <TableAction
                  record={row}
                  actions={tableActions.value}
                  dropDownActions={dropDownActions.value}
                />
              )
            },
            ...crudSchemaRef.value.tableActionColumn
          })
        }
        return columns
      }
    }
  })
  const {
    data: tableData,
    columns,
    loading,
    pagination,
    columnChecks,
    getData,
    refreshData,
    handleSizeChange,
    handleCurrentChange
  } = tableObject
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
  // 删除
  const handleDelete = (row: any) => {
    const rowKey = props.crudSchema.rowKey || 'id'
    const ids = row?.[rowKey]
      ? [row[rowKey]]
      : multipleSelection.value.map((item: any) => item[rowKey])
    props.crudSchema.crudApi
      ?.remove?.({
        [`${rowKey}s`]: ids
      })
      .then(() => {
        ElMessage.success(`删除${props.crudSchema.dialogTitle}成功`)
        tableObject.refreshRemove()
      })
  }
  // 定义一些只读状态
  const readonlyState = reactive<CrudReadonlyState>({
    selection: []
  })
  const multipleSelection = ref<any>([])
  const handleSelectionChange = (selection: any) => {
    multipleSelection.value = selection
    readonlyState.selection = selection
  }
  const crudInstanceMethods: CrudInstance = {
    async reload(params) {
      const values = await searchBarApi.getValues()
      return getData({
        ...values,
        ...params
      })
    },
    // 设置组件状态（props）
    setState(state: CrudSchema) {
      return new Promise((resolve) => {
        crudSchemaRef.value = {
          ...crudSchemaRef.value,
          ...state
        }
        nextTick(() => {
          resolve()
        })
      })
    },
    getState(): Promise<CrudSchema> {
      return new Promise((resolve) => {
        resolve(crudSchemaRef.value)
      })
    },
    getReadonlyState() {
      return readonlyState
    },
    getArtTableInstance() {
      return tableObject
    },
    getRowSelection() {
      return multipleSelection.value
    },
    removeByApi(row) {
      handleDelete(row)
    }
  }
  onMounted(() => {
    emit('register', crudInstanceMethods)
  })
</script>
<style lang="scss" scoped></style>
