<template>
  <SearchBar
    v-if="crudSchemaRef.useSearchForm !== false"
    @reset="handleReset"
    @submit="handleSearch"
  />
  <ElCard class="art-table-card" shadow="never">
    <!-- 表格头部 -->
    <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData" :layout="headerLayout">
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
      <template #tools>
        <div
          :key="item.auth"
          v-for="item in crudSchemaRef.toolbarConfig?.tools || []"
          class="btn"
          @click="handleToolbarToolClick(item.auth)"
        >
          <i class="iconfont-sys">
            <Icon :icon="item.icon" />
          </i>
        </div>
      </template>
      <template #right>
        <slot name="toolbar-tools"></slot>
      </template>
    </ArtTableHeader>
    <!-- 表格 -->
    <ArtTable
      :rowKey="crudSchemaRef.rowKey ?? 'id'"
      :loading="loading"
      :data="crudSchemaRef.data ?? tableData"
      :columns="columns"
      :pagination="crudSchemaRef.tree ? undefined : pagination"
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
  import { Icon } from '@/components/icon'
  import { getTreeNodeAndChildrenIds } from '@/utils/tool'
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
    (e: 'toolbarToolClick', code: string): void
  }>()
  const crudSchemaRef = ref(props.crudSchema)
  const dialogFormRef = ref<any>(null)
  // 计算各种操作按钮配置
  const { toolbarActions, dropDownToolbarActions, tableActions, dropDownActions } = useAction(
    crudSchemaRef.value,
    dialogFormRef,
    props.crudMethods
  )
  const headerLayout = computed(() => {
    const defaultLayout = ['refresh', 'size', 'fullscreen', 'columns', 'settings'] as const
    const toolbarConfig = crudSchemaRef.value.toolbarConfig || {}
    // 过滤掉被禁用的选项
    const layout = defaultLayout.filter((item) => toolbarConfig[item] !== false)

    return layout.join(',')
  })
  const funApi = computed(() => {
    const { api, requestMethod, beforeFetch, afterFetch } = props.crudSchema

    if (!api) return api as any

    const fun = (params: any) => {
      // 处理请求前的参数
      let processedParams = beforeFetch ? beforeFetch(params) : params

      // 发起请求
      const apiRequest =
        typeof api === 'string'
          ? request[requestMethod ?? 'post']({ url: api, params: processedParams })
          : api(processedParams)

      // 处理响应后的结果
      return afterFetch ? apiRequest.then(afterFetch) : apiRequest
    }

    return fun
  })
  const actionItemRecord = ref()
  const handleActionItemClick = (record: any) => {
    actionItemRecord.value = record
  }
  const [SearchBar, searchBarApi] = useSearchBar(crudSchemaRef.value.searchFormSchema || {})
  const tableObject = useTable<any>({
    core: {
      apiFn: funApi.value,
      immediate: crudSchemaRef.value.immediate ?? true,
      apiParams: {
        // 其他搜索参数
      },
      columnsFactory: () => {
        const columns = (
          (typeof crudSchemaRef.value.columns === 'function'
            ? crudSchemaRef.value.columns()
            : crudSchemaRef.value.columns) || []
        ).map((column) => {
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
            width: 220,
            align: 'center',
            fixed: 'right', // 固定列
            formatter: (row: unknown) => {
              return (
                <TableAction
                  onActionItemClick={handleActionItemClick}
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
    emit('submit', values)

    getData(values)
  }
  const handleReset = () => {
    //Object.assign(searchParams, {})
    emit('reset')

    getData({})
  }
  // 删除
  const handleDelete = (row: any) => {
    const rowKey = props.crudSchema.rowKey || 'id'
    let ids = row?.[rowKey]
      ? [row[rowKey]]
      : multipleSelection.value.map((item: any) => item[rowKey])

    // 如果是树形结构，需要获取节点及其所有子节点
    if (crudSchemaRef.value.tree) {
      const idKey = crudSchemaRef.value.tree.id || 'id'
      const childrenKey = crudSchemaRef.value.tree.children || 'children'

      // 收集所有选中节点及其子节点的ID
      const allIds: any[] = []
      const selectedRows = row?.[rowKey] ? [row] : multipleSelection.value

      selectedRows.forEach((selectedRow: any) => {
        const nodeIds = getTreeNodeAndChildrenIds(
          tableData.value,
          selectedRow[idKey],
          idKey,
          childrenKey
        )
        allIds.push(...nodeIds)
      })

      ids = allIds
    }

    props.crudSchema.crudApi
      ?.remove?.({
        [`${rowKey}s`]: ids
      })
      .then(() => {
        ElMessage.success(`删除${props.crudSchema.dialogTitle}成功`)
        tableObject.refreshRemove()
      })
  }
  const handleToolbarToolClick = (key: any) => {
    emit('toolbarToolClick', key)
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
    },
    openAddDialog() {
      dialogFormRef.value?.show({
        data: {},
        type: 'add',
        getCrudApi() {
          return props.crudMethods
        }
      })
    },
    openEditDialog() {
      dialogFormRef.value?.show({
        data: actionItemRecord.value,
        type: 'edit',
        getCrudApi() {
          return props.crudMethods
        }
      })
    },
    openViewDialog() {
      dialogFormRef.value?.show({
        data: {},
        type: 'view',
        getCrudApi() {
          return props.crudMethods
        }
      })
    },
    executeRemove() {
      handleDelete(actionItemRecord.value)
    },
    executeBatchRemove() {
      handleDelete({})
    }
  }
  onMounted(() => {
    emit('register', crudInstanceMethods)
  })
</script>
<style lang="scss" scoped>
  :deep(.table-size-btn-item) {
    .el-dropdown-menu__item {
      margin-bottom: 3px !important;
    }

    &:last-child {
      .el-dropdown-menu__item {
        margin-bottom: 0 !important;
      }
    }
  }

  :deep(.is-selected) {
    background-color: rgba(var(--art-gray-200-rgb), 0.8) !important;
  }

  .table-header {
    display: flex;
    justify-content: space-between;

    .left {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 0;
    }

    .right {
      display: flex;
      align-items: center;

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin-left: 10px;
        color: var(--art-gray-700);
        cursor: pointer;
        background-color: rgba(var(--art-gray-200-rgb), 0.8);
        border-radius: 6px;
        transition: color 0.3s;
        transition: all 0.3s;

        i {
          font-size: 16px;
          color: var(--art-gray-700);
          user-select: none;
        }

        &:hover {
          background-color: rgba(var(--art-gray-300-rgb), 0.75);

          i {
            color: var(--art-gray-800);
          }
        }
      }
    }
  }

  :deep(.column-option) {
    display: flex;
    align-items: center;

    .drag-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 18px;
      margin-right: 8px;
      color: var(--art-gray-500);
      cursor: move;

      i {
        font-size: 18px;
      }
    }
  }

  @media (max-width: $device-phone) {
    .table-header {
      flex-direction: column;

      .right {
        display: flex;
        justify-content: flex-end;
        margin-top: 10px;

        .btn {
          margin-right: 10px;
          margin-left: 0;
        }
      }
    }
  }
</style>
