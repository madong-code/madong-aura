<template>
  <div v-if="crudSchema?.useVxeTable" class="bg-card h-full flex flex-col">
    <vxe-grid
      ref="gridRef"
      :id="crudSchemaRef?.rowKey"
      :columns="vxeTableColumns"
      :toolbar-config="{
        refresh: true, // 刷新
        print: false, // 打印
        export: false, // 导出
        custom: true, // 自定义列
        zoom: true, // 最大化最小化,
        slots: {
          buttons: 'toolbar-left',
          tools: 'toolbar-right'
        }
      }"
      :keepSource="true"
      :tree-config="
        crudSchemaRef.tree
          ? {
              childrenField: crudSchemaRef.tree?.children || 'children',
              rowField: crudSchemaRef.tree?.id || 'id'
            }
          : undefined
      "
      height="auto"
      :pager-config="{
        enabled: crudSchemaRef.tree ? false : true,
        layouts: [
          'Total',
          'Sizes',
          'Home',
          'PrevJump',
          'PrevPage',
          'Number',
          'NextPage',
          'NextJump',
          'End'
        ],
        pageSize: 20,
        background: true,
        pageSizes: [10, 20, 30, 50, 100, 200],
        className: 'w-full',
        size: 'mini' as const,
        align: 'center'
    }"
      :proxy-config="{
        ajax: {
          query: ({ page }, formValues) => {
            return funApi({
              [tableConfig.paginationKey.current || 'pageNum']: page.currentPage,
              [tableConfig.paginationKey.size || 'pageSize']: page.pageSize,
              ...formValues
            })
          }
        },
        response: {
          result: ({data}: {data: any}) => {
             const fields = tableConfig.recordFields || ['rows']
              for (const field of fields) {
                if (data[field]) {
                  return data[field]
                }
              }
              return []
          },
          total: ({data}: {data: any}) => {
             const fields = tableConfig.totalFields || ['recordCount']
              for (const field of fields) {
                if (data[field]) {
                  return data[field]
                }
              }
              return 0
          },
          list: ({data}: {data: any}) => {
            if(crudSchemaRef.tree) return data;
             const fields = tableConfig.totalFields || ['rows']
              for (const field of fields) {
                if (data[field]) {
                  return data[field]
                }
              }
              return data
          },
        }
      }"
      @checkboxChange="handleCheckboxChange"
      @checkboxAll="handleCheckboxAll"
      v-bind="{ ...$attrs }"
    >
      <template #toolbar-left>
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
      <template #toolbar-right>
        <div class="pr-[7px]">
          <button
            :key="item.auth"
            :title="item.label"
            v-for="item in crudSchemaRef.toolbarConfig?.tools || []"
            class="vxe-button type--button is--circle"
            @click="handleToolbarToolClick(item.auth)"
          >
            <i class="iconfont-sys">
              <Icon :icon="item.icon" />
            </i>
          </button>
        </div>
        <slot name="toolbar-tools"></slot>
      </template>
      <template #form>
        <slot name="form">
          <div class="relative" v-if="crudSchemaRef.useSearchForm !== false">
            <SearchBar @reset="handleReset" @submit="handleSearch" />
          </div>
        </slot>
      </template>
      <template v-for="(_, slotName) in $slots" #[slotName]>
        <slot :name="slotName"></slot>
      </template>
    </vxe-grid>
  </div>
  <template v-else>
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
            class="button active"
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
  </template>
  <DialogForm
    v-bind="{ ...crudSchemaRef.dialogProps }"
    ref="dialogFormRef"
    :crud-schema="crudSchemaRef"
  />
</template>
<script setup lang="tsx">
  import { useSearchBar } from '@/components/search-bar'
  import { CrudInstance, CrudReadonlyState, CrudSchema } from './types'
  import request from '@/utils/http'
  import { TableAction } from '../table-action'
  import DialogForm from './dialog-form.vue'
  import { useAction } from './use-action'
  import { Icon } from '@/components/icon'
  import { getTreeNodeAndChildrenIds } from '@/utils/tool'
  import { useTable } from '@/hooks'
  import { useColumns } from './use-columns'
  import { tableConfig } from '@/utils/table/tableConfig'
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
          useVxeTable: false,
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
      immediate:
        (crudSchemaRef.value.immediate ?? true) && crudSchemaRef.value?.useVxeTable !== true,
      apiParams: {
        // 其他搜索参数
      },
      columnsFactory: () => {
        const { columns } = useColumns(
          crudSchemaRef,
          tableActions,
          dropDownActions,
          handleActionItemClick
        )
        return columns as any
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
    if (crudSchemaRef.value.useVxeTable === true) {
      gridRef.value?.commitProxy('query', values)
      return
    }
    getData(values)
  }
  const handleReset = () => {
    //Object.assign(searchParams, {})
    emit('reset')
    if (crudSchemaRef.value.useVxeTable === true) {
      gridRef.value?.commitProxy('query', {})
      return
    }
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
        if (crudSchemaRef.value.useVxeTable === true) {
          props.crudMethods?.refreshRemove(ids)
        } else {
          tableObject.refreshRemove()
        }
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
      if (crudSchemaRef.value.useVxeTable === true) {
        return await gridRef.value?.commitProxy('query', { ...values, ...params })
      }
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
    getVxeTableInstance() {
      return gridRef.value
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
  // vxe-table部分逻辑
  const gridRef = ref()
  const vxeTableColumns = computed<any>(() => {
    if (crudSchemaRef.value?.useVxeTable === true) {
      const { columns } = useColumns(
        crudSchemaRef,
        tableActions,
        dropDownActions,
        handleActionItemClick
      )
      return columns
    }
    return []
  })
  const handleCheckboxChange = () => {
    const records = gridRef.value.getCheckboxRecords()
    multipleSelection.value = records
    readonlyState.selection = records
  }
  const handleCheckboxAll = () => {
    const records = gridRef.value.getCheckboxRecords()
    multipleSelection.value = records
    readonlyState.selection = records
  }
</script>
<style scoped>
  @reference '@styles/core/tailwind.css';

  .button {
    @apply ml-2 
    size-8 
    flex 
    items-center 
    justify-center 
    cursor-pointer 
    rounded-md 
    bg-g-300/55
    dark:bg-g-300/40
    text-g-700  
    hover:bg-g-300 
    md:ml-0 
    md:mr-2.5;
  }
</style>
