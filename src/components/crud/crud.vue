<script setup lang="tsx">
  import type { FormDialogOptions } from './components/dialog/types'
  import type { CrudApiInstance, CrudSchema, FormActionType } from './components/types'

  import type { VbenFormProps } from '#/adapter/form'

  import { computed, nextTick, reactive, ref, shallowReactive, toRaw, useSlots } from 'vue'
  import { useRoute } from 'vue-router'

  import { ElMessage, ElMessageBox } from 'element-plus'

  import { useVbenVxeGrid } from '#/adapter/vxe-table'
  import { $t } from '#/locales'

  import FormDialogComponent from './components/dialog/dialog.vue'
  import { TableAction } from './components/table-action'
  import { useAction } from './use-action'
  import { useColumns } from './use-columns'

  const props = withDefaults(
    defineProps<{
      /** CRUD API 实例（可选，内部会自动创建） */
      crudApi?: CrudApiInstance
      crudSchema: CrudSchema
      /** 是否内置表单弹窗，默认 true */
      embeddedFormDialog?: boolean
    }>(),
    {
      embeddedFormDialog: true,
      crudApi: undefined
    }
  )

  const emit = defineEmits<{
    register: [instance: any]
  }>()

  const EXCLUDED_SLOTS = new Set(['toolbar-actions', 'toolbar-tools'])

  const slots = useSlots()

  const dialogFormRef = ref<InstanceType<typeof FormDialogComponent> | null>(null)
  const readonlyState = reactive<{ selection: any[] }>({ selection: [] })
  const route = useRoute()

  // 动态状态，用于存储通过 setState 设置的配置
  const dynamicState = shallowReactive<Record<string, unknown>>({})

  // 合并后的 crudSchema，优先使用动态配置
  const mergedCrudSchema = computed<CrudSchema>(() => {
    const schema = Object.assign({}, props.crudSchema, dynamicState) as CrudSchema
    return {
      ...schema,
      formDialog: schema.formDialog ?? {
        dialogType: schema.dialogType,
        enabled: schema.useCrud !== false,
        schema: schema.formSchema,
        title: schema.dialogTitle,
        width: schema.dialogWidth
      },
      searchForm: schema.searchForm ?? {
        enabled: schema.useSearchForm !== false,
        schema: schema.searchFormSchema
      },
      toolbar: schema.toolbar ?? schema.toolbarConfig
    } as CrudSchema
  })

  // ============ 表格配置 ============
  // 直接使用扁平化配置
  const tableConfig = computed(() => mergedCrudSchema.value)

  // ============ 工具栏动作配置 ============
  const {
    toolbarActions,
    dropDownToolbarActions,
    toolbarToolActions,
    tableActions,
    dropDownActions
  } = useAction(
    mergedCrudSchema.value as CrudSchema,
    dialogFormRef,
    props.crudApi ?? {
      executeBatchRemove: () => {},
      executeRemove: () => {}
    },
    () => readonlyState.selection
  )

  // 智能合并：当 dropDownToolbarActions 只有 1 个按钮时，直接放到工具栏
  const finalToolbarActions = computed(() => {
    if (dropDownToolbarActions.value.length === 1) {
      return [...toolbarActions.value, ...dropDownToolbarActions.value]
    }
    return toolbarActions.value
  })

  const finalDropDownToolbarActions = computed(() => {
    if (dropDownToolbarActions.value.length <= 1) {
      return []
    }
    return dropDownToolbarActions.value
  })

  // 获取表格列定义（支持顶层和嵌套两种配置方式）
  const tableColumns = computed(() => {
    const cols = tableConfig.value.columns
    if (!cols) return []
    return typeof cols === 'function' ? cols() : cols
  })

  const columns = useColumns(
    {
      // 传 getter 而非数组快照：列定义里的 $t 需要在语言切换时重新求值
      columns: () => tableColumns.value,
      tableActionColumn: tableConfig.value.tableActionColumn
    },
    tableActions,
    dropDownActions
  )

  const filteredSlots = computed(() => {
    const result: Record<string, any> = {}
    for (const name of Object.keys(slots)) {
      if (!EXCLUDED_SLOTS.has(name)) {
        result[name] = slots[name]
      }
    }
    return result
  })

  // ============ 搜索表单配置 ============
  const searchFormEnabled = computed(() => {
    return mergedCrudSchema.value.searchForm?.enabled !== false
  })

  const searchFormSchema = computed(() => {
    const schema = mergedCrudSchema.value.searchForm?.schema
    if (!schema) return undefined
    return typeof schema === 'function' ? schema() : schema
  })

  const mergedFormOptions = computed((): undefined | VbenFormProps => {
    if (!searchFormEnabled.value || !searchFormSchema.value?.length) return undefined

    const sf = mergedCrudSchema.value.searchForm

    return {
      schema: searchFormSchema.value as any,
      submitOnChange: sf?.submitOnChange ?? false,
      collapsed: sf?.collapsed ?? false,
      collapsedRows: sf?.collapsedRows ?? 2,
      commonConfig: sf?.commonConfig,
      showDefaultActions: true,
      compact: true
    }
  })

  // ============ 表单弹窗配置 ============
  const formDialogEnabled = computed(() => {
    return mergedCrudSchema.value.formDialog?.enabled !== false
  })

  const formDialogTitle = computed(() => {
    const title = mergedCrudSchema.value.formDialog?.title
    // 支持函数形式，保证语言切换后标题实时更新
    return typeof title === 'function' ? title() : title || ''
  })

  const formDialogWidth = computed(() => {
    return mergedCrudSchema.value.formDialog?.width || 'w-[60%]'
  })

  // 默认行1列配置
  const formDialogWrapperClass = computed(() => {
    return mergedCrudSchema.value.formDialog?.wrapperClass || 'grid-cols-1'
  })

  // 表单弹窗配置（使用 getter 函数确保 crudInstance 已定义）
  function getFormDialogOptions(): FormDialogOptions {
    const fd = mergedCrudSchema.value.formDialog
    const { crudApi: api } = mergedCrudSchema.value
    const tableProxy = tableConfig.value.proxyConfig

    // table.proxyConfig 可覆盖 crudApi
    const finalApi = tableProxy
      ? {
          add: tableProxy.create || api.add,
          edit: tableProxy.update || api.edit,
          view: tableProxy.get || api.view
        }
      : {
          add: api.add,
          edit: api.edit,
          view: api.view
        }

    return {
      schema: fd?.schema as any,
      api: fd?.api || finalApi,
      dialogType: fd?.dialogType || 'modal',
      title: formDialogTitle.value,
      width: formDialogWidth.value,
      rowKey: tableConfig.value.rowKey || 'id',
      layout: fd?.layout,
      wrapperClass: formDialogWrapperClass.value,
      // 表单内容区宽度（默认 w-1/2，配置 w-full 可整行铺满）
      formWidth: fd?.formWidth,
      commonConfig: fd?.commonConfig,
      draggable: fd?.draggable,
      fullscreenButton: fd?.fullscreenButton,
      transformFormValues: fd?.transformFormValues,
      // 支持业务层自定义 onSuccess 回调，未提供则使用默认刷新逻辑
      onSuccess:
        fd?.onSuccess ||
        ((type: FormActionType, values?: Record<string, any>) => {
          const api = props.crudApi || crudInstance
          const grid = gridApi.grid
          const rowKey = tableConfig.value.rowKey || 'id'

          // 编辑场景：懒加载树（深层 >2 级）若整体 query 会丢失已展开层级、整表刷新。
          // 改为用 vxe 的 updateData 就地更新对应行，保留所有展开状态，只刷新那一行。
          if (type === 'edit' && values && grid && mergedTreeConfig.value?.lazy) {
            const id = values[rowKey]
            if (id !== undefined && id !== null) {
              const fullData = grid.getTableData()?.fullData || []
              const oldRow = fullData.find((r: any) => r[rowKey] === id)
              if (oldRow) {
                // 合并旧行（保留 hasChild / 层级树态字段）与提交值
                ;(grid as any).updateData([{ ...oldRow, ...values }])
                // updateData 会重置该行的子树加载态并收起，导致编辑节点本身及下层层级丢失。
                // 这里把编辑行重新展开，恢复其原本的展开状态（连同父链已展开的层级一起保留）。
                const updatedRow = (grid.getTableData()?.fullData || []).find(
                  (r: any) => r[rowKey] === id
                )
                if (updatedRow) {
                  grid.setTreeExpand(updatedRow, true)
                }
                return
              }
            }
            // 未在已加载数据中找到（如跨页/未展开路径）：回退到局部刷新
            api.refreshUpdate()
            return
          }

          if (type === 'edit') {
            api.refreshUpdate()
          } else {
            api.refreshCreate()
          }
        })
    } as FormDialogOptions
  }

  // ============ Grid 配置 ============
  const mergedToolbarConfig = computed(() => {
    const tc = tableConfig.value.toolbar
    const hasSearchForm = searchFormEnabled.value && !!searchFormSchema.value?.length

    return {
      refresh: tc?.refresh ?? true,
      custom: tc?.custom ?? true,
      zoom: tc?.zoom ?? true,
      export: tc?.export ?? false,
      search: hasSearchForm,
      // 自定义刷新行为：先以当前搜索表单值（含未提交的修改）更新最近提交值，
      // 再通过 refreshSoft 重新查询，保持树形展开等页面状态与数据一致
      refreshOptions: {
        query: async () => {
          const formApi = crudInstance.getFormApi()
          if (formApi?.isMounted) {
            try {
              const values = toRaw(await formApi.getValues())
              formApi.setLatestSubmissionValues(values)
            } catch {
              // 表单未就绪时忽略，沿用最近提交的搜索条件
            }
          }
          crudInstance.refreshSoft()
        }
      }
    }
  })

  const mergedTreeConfig = computed(() => {
    const tree = tableConfig.value.tree
    if (!tree) return undefined

    const config: Record<string, any> = {
      parentField: tree.pid || 'parentId',
      rowField: tree.id || 'id',
      childrenField: tree.children || 'children',
      transform: false,
      // 透传 reserve 配置，刷新后保持展开状态
      reserve: tree.reserve ?? false
    }

    // 懒加载树：透传 lazy 与 loadMethod，展开节点时按 pid 异步加载子级
    if (tree.lazy) {
      config.lazy = true
      if (tree.loadMethod) {
        config.loadMethod = async ({ row }: any) => {
          return await tree.loadMethod!({ row })
        }
      }
    }

    return config
  })

  // 事件类对象识别：vxe 工具栏刷新按钮会把原生事件对象（如 PointerEvent，
  // 可能被代理包装导致 instanceof 失效）作为第二个参数透传给 query，
  // 不能直接展开，否则会混入 isTrusted 等事件属性并丢失搜索条件
  function isEventLike(value: any): boolean {
    return !!value && typeof value === 'object' && ('isTrusted' in value || value instanceof Event)
  }

  // 解析 query 的表单值参数：
  // 1. 显式传参（搜索/重置/初始加载）：直接使用；
  // 2. 工具栏刷新按钮透传事件对象：改读当前搜索表单值（含未提交的修改），
  //    并回写为最新提交值，保证刷新携带当前生效的条件且后续操作保持一致；
  // 3. 未传参（翻页/排序等）：回退为最近一次提交的搜索条件。
  async function resolveQueryFormValues(formValues: any): Promise<Record<string, any>> {
    const formApi = crudInstance.getFormApi()
    let extraValues: Record<string, any> | undefined = formValues
    if (isEventLike(extraValues)) {
      if (formApi?.isMounted) {
        try {
          extraValues = toRaw(await formApi.getValues())
          formApi.setLatestSubmissionValues(extraValues)
        } catch {
          extraValues = undefined
        }
      } else {
        extraValues = undefined
      }
    }
    const latestValues = (formApi?.getLatestSubmissionValues?.() as Record<string, any>) ?? {}
    return { ...latestValues, ...extraValues }
  }

  const mergedGridOptions = computed(() => {
    const { crudApi: api } = mergedCrudSchema.value
    const paginationConfig = tableConfig.value.pagination
    const isTreeMode = !!mergedTreeConfig.value
    // 懒加载树：保留分页（顶层分页查询，子级由 loadMethod 异步加载）
    const isLazyTree = !!mergedTreeConfig.value?.lazy

    // 获取最终使用的 API（table.proxyConfig 可覆盖 crudApi）
    const finalApi = tableConfig.value.proxyConfig
      ? {
          list: tableConfig.value.proxyConfig.query || api.list,
          add: tableConfig.value.proxyConfig.create || api.add,
          edit: tableConfig.value.proxyConfig.update || api.edit,
          remove: tableConfig.value.proxyConfig.delete || api.remove,
          view: tableConfig.value.proxyConfig.get || api.view
        }
      : api

    return {
      columns: columns.value,
      height: tableConfig.value.height ?? 'auto',
      keepSource: tableConfig.value.keepSource ?? true,
      // 直接使用配置值，由全局配置兜底
      border: tableConfig.value.border,
      stripe: tableConfig.value.stripe,
      hoverRow: tableConfig.value.hoverRow,
      highlightCurrentRow: tableConfig.value.highlightCurrentRow,
      highlightHoverColumn: tableConfig.value.highlightHoverColumn,
      showOverflow: tableConfig.value.showOverflow,
      // 树形模式下自动禁用分页（懒加载树保留分页）
      pagerConfig:
        isTreeMode && !isLazyTree ? { enabled: false } : (tableConfig.value.pagerConfig ?? true),
      sortConfig: tableConfig.value.sortConfig,
      filterConfig: tableConfig.value.filterConfig,
      exportConfig: tableConfig.value.exportConfig,
      contextMenuConfig: tableConfig.value.contextMenuConfig,
      scrollY: tableConfig.value.scrollY,
      // 行号列宽
      seqColumnWidth: tableConfig.value.seqColumnWidth ?? (isTreeMode ? 50 : 60),
      // 选择列宽
      checkboxWidth: tableConfig.value.checkboxColumnWidth ?? 60,
      // 是否可选择（树形模式下默认禁用）
      checkboxConfig: isTreeMode
        ? undefined
        : tableConfig.value.checkable === false
          ? undefined
          : { checkKey: tableConfig.value.rowKey || 'id' },
      treeConfig: mergedTreeConfig.value,
      toolbarConfig: mergedToolbarConfig.value,
      proxyConfig: {
        ajax: {
          query: async ({ page }: any, formValues: any) => {
            // 解析搜索条件（详见 resolveQueryFormValues）
            const mergedFormValues = await resolveQueryFormValues(formValues)
            // 静态树形模式不分页；懒加载树保留分页（顶层 pid 由 beforeFetch 注入）
            const params =
              isTreeMode && !isLazyTree
                ? { ...mergedFormValues }
                : {
                    [paginationConfig?.currentKey || 'page']: page.currentPage,
                    [paginationConfig?.sizeKey || 'limit']: page.pageSize,
                    ...mergedFormValues
                  }
            // 使用合并后的 beforeFetch（优先顶层配置）
            const beforeFetch = tableConfig.value.beforeFetch
            const processedParams = beforeFetch ? beforeFetch(params) : params
            let result = await finalApi.list(processedParams)
            // 使用合并后的 afterFetch（优先顶层配置）
            const afterFetch = tableConfig.value.afterFetch
            if (afterFetch) {
              result = afterFetch(result)
            }
            return result
          }
        }
      }
    }
  })

  // 多选框勾选变化事件
  const mergedGridEvents = computed(() => {
    return {
      // 点击单行 checkbox 时触发
      'checkbox-change': ({ records }: { records: any[] }) => {
        readonlyState.selection = records
      },
      // 点击全选 checkbox 时触发
      'checkbox-all': ({ records }: { records: any[] }) => {
        readonlyState.selection = records
      }
    }
  })

  // ============ CRUD 实例 ============

  // 树形展开状态保持：记录当前展开的行 ID
  function getExpandedRowIds(): any[] {
    const grid = gridApi.grid
    if (!grid) return []
    return (grid.getTreeExpandRecords() || []).map(
      (row: any) => row[tableConfig.value.rowKey || 'id']
    )
  }

  // 树形展开状态保持：恢复展开状态
  function restoreExpand(rowIds: any[]) {
    if (rowIds.length === 0) return
    const grid = gridApi.grid
    if (!grid) return
    nextTick(() => {
      const rowKey = tableConfig.value.rowKey || 'id'
      const fullData = grid.getTableData()?.fullData || []
      const expandRows = fullData.filter((row: any) => rowIds.includes(row[rowKey]))
      if (expandRows.length > 0) {
        grid.setTreeExpand(expandRows, true)
      }
    })
  }

  // 是否启用树形展开状态保持
  function isTreeReserveEnabled() {
    return !!tableConfig.value.tree?.reserve
  }

  // 轻度刷新：保持展开状态
  function queryWithReserve() {
    let expandedIds: any[] = []
    if (isTreeReserveEnabled()) {
      expandedIds = getExpandedRowIds()
    }
    const result = gridApi.query()
    if (isTreeReserveEnabled()) {
      result.then(() => restoreExpand(expandedIds))
    }
    return result
  }

  // 获取路径参数（用于删除等操作时携带额外参数）
  function getPathParams(row?: any) {
    // 兼容新旧两种配置方式
    const pathParamsConfig = tableConfig.value.pathParams
    if (!pathParamsConfig || pathParamsConfig.length === 0) return {}

    const pathParams: Record<string, any> = {}

    for (const config of pathParamsConfig) {
      if (config.source === 'row' && config.field && row) {
        // 从行数据中获取参数
        pathParams[config.key] = row[config.field]
      } else if (config.source === 'route') {
        // 从路由参数中获取
        const routeKey = config.routeKey || config.key
        pathParams[config.key] = route.params[routeKey]
      }
    }

    return pathParams
  }

  // 删除
  async function handleSingleDelete(row: any) {
    const rowKey = tableConfig.value.rowKey || 'id'
    const id = row[rowKey]

    // 优先使用 proxyConfig.delete，其次使用 crudApi.remove（单个删除）
    const removeApi = tableConfig.value.proxyConfig?.delete || mergedCrudSchema.value.crudApi.remove

    if (!removeApi) {
      ElMessage.error($t('components.crud.message.no_delete_api'))
      return
    }

    try {
      await ElMessageBox.confirm(
        $t('components.crud.table.confirm_delete', [
          formDialogTitle.value || $t('components.crud.table.action')
        ]),
        $t('components.crud.table.delete_confirm_title'),
        { type: 'warning' }
      )
    } catch {
      // 用户取消
      return
    }

    try {
      crudInstance.setLoading(true)
      await removeApi(id)
      ElMessage.success(
        $t('components.crud.message.delete_success', [
          formDialogTitle.value || $t('components.crud.table.action')
        ])
      )
      crudInstance.refreshRemove()
    } finally {
      crudInstance.setLoading(false)
    }
  }

  // 批量删除
  async function handleBatchDelete() {
    const rowKey = tableConfig.value.rowKey || 'id'
    const ids = readonlyState.selection.map((item: any) => item[rowKey])

    if (ids.length === 0) {
      ElMessage.warning($t('components.crud.message.no_selection'))
      return
    }

    try {
      await ElMessageBox.confirm(
        $t('components.crud.table.confirm_batch_delete', [
          ids.length.toString(),
          formDialogTitle.value || $t('components.crud.table.action')
        ]),
        $t('components.crud.table.batch_delete_confirm_title'),
        { type: 'warning' }
      )
    } catch {
      // 用户取消
      return
    }

    const pathParams = getPathParams()
    const batchRemoveApi =
      tableConfig.value.proxyConfig?.deleteBatch ||
      (mergedCrudSchema.value.crudApi as any).batchRemove

    if (!batchRemoveApi) {
      ElMessage.error($t('components.crud.message.no_batch_delete_api'))
      return
    }

    try {
      crudInstance.setLoading(true)
      await batchRemoveApi({ ids, ...pathParams })
      ElMessage.success(
        $t('components.crud.message.delete_success', [
          formDialogTitle.value || $t('components.crud.table.action')
        ])
      )
      readonlyState.selection = []
      gridApi.grid?.clearCheckboxRow()
      crudInstance.refreshRemove()
    } finally {
      crudInstance.setLoading(false)
    }
  }

  // 保留原来的 handleDelete 逻辑，但区分单删和批量
  function handleDelete(row: any) {
    if (row) {
      handleSingleDelete(row)
    } else {
      handleBatchDelete()
    }
  }

  const crudInstance: CrudApiInstance = {
    query: (params?: any) => gridApi.query(params),
    reload: (params?: any) => gridApi.reload(params),
    setLoading: (loading: boolean) => gridApi.setLoading(loading),
    getGridInstance: () => gridApi.grid,
    getFormApi: () => gridApi.formApi,
    getRowSelection: () => readonlyState.selection,
    getReadonlyState: () => readonlyState,

    refreshData: () => gridApi.reload(),
    refreshSoft: () => queryWithReserve(),
    refreshCreate: () => gridApi.reload(),
    refreshUpdate: () => queryWithReserve(),
    refreshRemove() {
      const grid = gridApi.grid
      if (!grid) return
      const fullData = grid.getTableData()?.fullData
      if (fullData?.length === 1 || fullData?.length === readonlyState.selection.length) {
        const proxyInfo = grid.getProxyInfo()
        if (proxyInfo?.pager && proxyInfo.pager.currentPage > 1) {
          proxyInfo.pager.currentPage -= 1
        }
      }
      queryWithReserve()
    },

    openAddDialog: (data?: Record<string, any>) => {
      dialogFormRef.value?.openAdd(data)
    },
    openEditDialog: (row: any) => {
      dialogFormRef.value?.openEdit(row)
    },
    openViewDialog: (row: any) => {
      dialogFormRef.value?.openView(row)
    },

    removeByApi: (row: any) => {
      handleDelete(row)
    },
    executeRemove: (row: any) => {
      handleDelete(row)
    },
    executeBatchRemove: () => {
      handleBatchDelete()
    },
    setGridOptions: (options: Record<string, any>) => {
      gridApi.setGridOptions(options)
    }
  }

  // 创建 Grid
  const [VxeGrid, gridApi] = useVbenVxeGrid({
    gridOptions: mergedGridOptions.value as any,
    gridEvents: mergedGridEvents.value as any,
    formOptions: mergedFormOptions.value
  })

  emit('register', crudInstance)
  defineExpose(crudInstance)
</script>

<template>
  <div class="bg-card h-full flex flex-col">
    <VxeGrid
      :grid-options="mergedGridOptions as any"
      :form-options="mergedFormOptions"
      v-bind="$attrs"
    >
      <template #toolbar-actions>
        <slot
          name="toolbar-actions"
          :actions="finalToolbarActions"
          :drop-down-toolbar-actions="finalDropDownToolbarActions"
        >
          <TableAction
            :actions="finalToolbarActions"
            :drop-down-actions="finalDropDownToolbarActions"
          />
        </slot>
      </template>
      <template #toolbar-tools>
        <slot name="toolbar-tools" :actions="toolbarToolActions">
          <TableAction :actions="toolbarToolActions" />
        </slot>
      </template>
      <template v-for="(_, name) in filteredSlots" #[name]="slotData">
        <slot :name="name" v-bind="slotData ?? {}"></slot>
      </template>
    </VxeGrid>
    <!-- 表单弹窗：仅在启用时渲染 -->
    <FormDialogComponent
      v-if="formDialogEnabled"
      ref="dialogFormRef"
      :options="getFormDialogOptions()"
    />
  </div>
</template>
