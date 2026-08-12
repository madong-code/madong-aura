<script setup lang="tsx">
import type { FormDialogOptions } from './components/dialog/types';
import type {
  CrudApiInstance,
  CrudSchema,
  FormActionType,
} from './components/types';

import type { VbenFormProps } from '#/adapter/form';

import {
  computed,
  nextTick,
  reactive,
  ref,
  shallowReactive,
  useSlots,
} from 'vue';
import { useRoute } from 'vue-router';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';

import FormDialogComponent from './components/dialog/dialog.vue';
import { TableAction } from './components/table-action';
import { useAction } from './use-action';
import { useColumns } from './use-columns';

const props = withDefaults(
  defineProps<{
    /** CRUD API 实例（可选，内部会自动创建） */
    crudApi?: CrudApiInstance;
    crudSchema: CrudSchema;
    /** 是否内置表单弹窗，默认 true */
    embeddedFormDialog?: boolean;
  }>(),
  {
    embeddedFormDialog: true,
    crudApi: undefined,
  },
);

const emit = defineEmits<{
  register: [instance: any];
}>();

const EXCLUDED_SLOTS = new Set(['toolbar-actions', 'toolbar-tools']);

const slots = useSlots();

const dialogFormRef = ref<InstanceType<typeof FormDialogComponent> | null>(
  null,
);
const readonlyState = reactive<{ selection: any[] }>({ selection: [] });
const route = useRoute();

// 动态状态，用于存储通过 setState 设置的配置
const dynamicState = shallowReactive<Record<string, unknown>>({});

// 合并后的 crudSchema，优先使用动态配置
const mergedCrudSchema = computed<CrudSchema>(() => {
  const schema = Object.assign(
    {},
    props.crudSchema,
    dynamicState,
  ) as CrudSchema;
  return {
    ...schema,
    formDialog: schema.formDialog ?? {
      dialogType: schema.dialogType,
      enabled: schema.useCrud !== false,
      schema: schema.formSchema,
      title: schema.dialogTitle,
      width: schema.dialogWidth,
    },
    searchForm: schema.searchForm ?? {
      enabled: schema.useSearchForm !== false,
      schema: schema.searchFormSchema,
    },
    toolbar: schema.toolbar ?? schema.toolbarConfig,
  } as CrudSchema;
});

// ============ 表格配置 ============
// 直接使用扁平化配置
const tableConfig = computed(() => mergedCrudSchema.value);

// ============ 工具栏动作配置 ============
const {
  toolbarActions,
  dropDownToolbarActions,
  toolbarToolActions,
  tableActions,
  dropDownActions,
} = useAction(
  mergedCrudSchema.value as CrudSchema,
  dialogFormRef,
  props.crudApi ?? {
    executeBatchRemove: () => {},
    executeRemove: () => {},
  },
  () => readonlyState.selection,
);

// 智能合并：当 dropDownToolbarActions 只有 1 个按钮时，直接放到工具栏
const finalToolbarActions = computed(() => {
  if (dropDownToolbarActions.value.length === 1) {
    return [...toolbarActions.value, ...dropDownToolbarActions.value];
  }
  return toolbarActions.value;
});

const finalDropDownToolbarActions = computed(() => {
  if (dropDownToolbarActions.value.length <= 1) {
    return [];
  }
  return dropDownToolbarActions.value;
});

// 获取表格列定义（支持顶层和嵌套两种配置方式）
const tableColumns = computed(() => {
  const cols = tableConfig.value.columns;
  if (!cols) return [];
  return typeof cols === 'function' ? cols() : cols;
});

const columns = useColumns(
  {
    columns: tableColumns.value,
    tableActionColumn: tableConfig.value.tableActionColumn,
  },
  tableActions,
  dropDownActions,
);

const filteredSlots = computed(() => {
  const result: Record<string, any> = {};
  for (const name of Object.keys(slots)) {
    if (!EXCLUDED_SLOTS.has(name)) {
      result[name] = slots[name];
    }
  }
  return result;
});

// ============ 搜索表单配置 ============
const searchFormEnabled = computed(() => {
  return mergedCrudSchema.value.searchForm?.enabled !== false;
});

const searchFormSchema = computed(() => {
  const schema = mergedCrudSchema.value.searchForm?.schema;
  if (!schema) return undefined;
  return typeof schema === 'function' ? schema() : schema;
});

const mergedFormOptions = computed((): undefined | VbenFormProps => {
  if (!searchFormEnabled.value || !searchFormSchema.value?.length)
    return undefined;

  const sf = mergedCrudSchema.value.searchForm;

  return {
    schema: searchFormSchema.value as any,
    submitOnChange: sf?.submitOnChange ?? false,
    collapsed: sf?.collapsed ?? false,
    collapsedRows: sf?.collapsedRows ?? 2,
    commonConfig: sf?.commonConfig,
    showDefaultActions: true,
    compact: true,
  };
});

// ============ 表单弹窗配置 ============
const formDialogEnabled = computed(() => {
  return mergedCrudSchema.value.formDialog?.enabled !== false;
});

const formDialogTitle = computed(() => {
  return mergedCrudSchema.value.formDialog?.title || '';
});

const formDialogWidth = computed(() => {
  return mergedCrudSchema.value.formDialog?.width || 'w-[60%]';
});

// 默认行1列配置
const formDialogWrapperClass = computed(() => {
  return mergedCrudSchema.value.formDialog?.wrapperClass || 'grid-cols-1';
});

// 表单弹窗配置（使用 getter 函数确保 crudInstance 已定义）
function getFormDialogOptions(): FormDialogOptions {
  const fd = mergedCrudSchema.value.formDialog;
  const { crudApi: api } = mergedCrudSchema.value;
  const tableProxy = tableConfig.value.proxyConfig;

  // table.proxyConfig 可覆盖 crudApi
  const finalApi = tableProxy
    ? {
        add: tableProxy.create || api.add,
        edit: tableProxy.update || api.edit,
        view: tableProxy.get || api.view,
      }
    : {
        add: api.add,
        edit: api.edit,
        view: api.view,
      };

  return {
    schema: fd?.schema as any,
    api: fd?.api || finalApi,
    dialogType: fd?.dialogType || 'modal',
    title: formDialogTitle.value,
    width: formDialogWidth.value,
    rowKey: tableConfig.value.rowKey || 'id',
    layout: fd?.layout,
    wrapperClass: formDialogWrapperClass.value,
    commonConfig: fd?.commonConfig,
    draggable: fd?.draggable,
    fullscreenButton: fd?.fullscreenButton,
    transformFormValues: fd?.transformFormValues,
    // 支持业务层自定义 onSuccess 回调，未提供则使用默认刷新逻辑
    onSuccess:
      fd?.onSuccess ||
      ((type: FormActionType, _values?: Record<string, any>) => {
        const api = props.crudApi || crudInstance;
        if (type === 'edit') {
          api.refreshUpdate();
        } else {
          api.refreshCreate();
        }
      }),
  } as FormDialogOptions;
}

// ============ Grid 配置 ============
const mergedToolbarConfig = computed(() => {
  const tc = tableConfig.value.toolbar;
  const hasSearchForm =
    searchFormEnabled.value && !!searchFormSchema.value?.length;

  return {
    refresh: tc?.refresh ?? true,
    custom: tc?.custom ?? true,
    zoom: tc?.zoom ?? true,
    export: tc?.export ?? false,
    search: hasSearchForm,
  };
});

const mergedTreeConfig = computed(() => {
  const tree = tableConfig.value.tree;
  if (!tree) return undefined;

  return {
    parentField: tree.pid || 'parentId',
    rowField: tree.id || 'id',
    childrenField: tree.children || 'children',
    transform: false,
    // 透传 reserve 配置，刷新后保持展开状态
    reserve: tree.reserve ?? false,
  };
});

const mergedGridOptions = computed(() => {
  const { crudApi: api } = mergedCrudSchema.value;
  const paginationConfig = tableConfig.value.pagination;
  const isTreeMode = !!mergedTreeConfig.value;

  // 获取最终使用的 API（table.proxyConfig 可覆盖 crudApi）
  const finalApi = tableConfig.value.proxyConfig
    ? {
        list: tableConfig.value.proxyConfig.query || api.list,
        add: tableConfig.value.proxyConfig.create || api.add,
        edit: tableConfig.value.proxyConfig.update || api.edit,
        remove: tableConfig.value.proxyConfig.delete || api.remove,
        view: tableConfig.value.proxyConfig.get || api.view,
      }
    : api;

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
    // 树形模式下自动禁用分页
    pagerConfig: isTreeMode
      ? { enabled: false }
      : (tableConfig.value.pagerConfig ?? true),
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
          // 树形模式不分页
          const params = isTreeMode
            ? { ...formValues }
            : {
                [paginationConfig?.currentKey || 'page']: page.currentPage,
                [paginationConfig?.sizeKey || 'limit']: page.pageSize,
                ...formValues,
              };
          // 使用合并后的 beforeFetch（优先顶层配置）
          const beforeFetch = tableConfig.value.beforeFetch;
          const processedParams = beforeFetch ? beforeFetch(params) : params;
          let result = await finalApi.list(processedParams);
          // 使用合并后的 afterFetch（优先顶层配置）
          const afterFetch = tableConfig.value.afterFetch;
          if (afterFetch) {
            result = afterFetch(result);
          }
          return result;
        },
      },
    },
  };
});

// 多选框勾选变化事件
const mergedGridEvents = computed(() => {
  return {
    // 点击单行 checkbox 时触发
    'checkbox-change': ({ records }: { records: any[] }) => {
      readonlyState.selection = records;
    },
    // 点击全选 checkbox 时触发
    'checkbox-all': ({ records }: { records: any[] }) => {
      readonlyState.selection = records;
    },
  };
});

// ============ CRUD 实例 ============

// 树形展开状态保持：记录当前展开的行 ID
function getExpandedRowIds(): any[] {
  const grid = gridApi.grid;
  if (!grid) return [];
  return (grid.getTreeExpandRecords() || []).map(
    (row: any) => row[tableConfig.value.rowKey || 'id'],
  );
}

// 树形展开状态保持：恢复展开状态
function restoreExpand(rowIds: any[]) {
  if (rowIds.length === 0) return;
  const grid = gridApi.grid;
  if (!grid) return;
  nextTick(() => {
    const rowKey = tableConfig.value.rowKey || 'id';
    const fullData = grid.getTableData()?.fullData || [];
    const expandRows = fullData.filter((row: any) =>
      rowIds.includes(row[rowKey]),
    );
    if (expandRows.length > 0) {
      grid.setTreeExpand(expandRows, true);
    }
  });
}

// 是否启用树形展开状态保持
function isTreeReserveEnabled() {
  return !!tableConfig.value.tree?.reserve;
}

// 轻度刷新：保持展开状态
function queryWithReserve() {
  let expandedIds: any[] = [];
  if (isTreeReserveEnabled()) {
    expandedIds = getExpandedRowIds();
  }
  const result = gridApi.query();
  if (isTreeReserveEnabled()) {
    result.then(() => restoreExpand(expandedIds));
  }
  return result;
}

// 获取路径参数（用于删除等操作时携带额外参数）
function getPathParams(row?: any) {
  // 兼容新旧两种配置方式
  const pathParamsConfig = tableConfig.value.pathParams;
  if (!pathParamsConfig || pathParamsConfig.length === 0) return {};

  const pathParams: Record<string, any> = {};

  for (const config of pathParamsConfig) {
    if (config.source === 'row' && config.field && row) {
      // 从行数据中获取参数
      pathParams[config.key] = row[config.field];
    } else if (config.source === 'route') {
      // 从路由参数中获取
      const routeKey = config.routeKey || config.key;
      pathParams[config.key] = route.params[routeKey];
    }
  }

  return pathParams;
}

// 删除
async function handleSingleDelete(row: any) {
  const rowKey = tableConfig.value.rowKey || 'id';
  const id = row[rowKey];

  // 优先使用 proxyConfig.delete，其次使用 crudApi.remove（单个删除）
  const removeApi =
    tableConfig.value.proxyConfig?.delete ||
    mergedCrudSchema.value.crudApi.remove;

  if (!removeApi) {
    ElMessage.error($t('components.crud.message.no_delete_api'));
    return;
  }

  try {
    await ElMessageBox.confirm(
      $t('components.crud.table.confirm_delete', [
        formDialogTitle.value || $t('components.crud.table.action'),
      ]),
      $t('components.crud.table.delete_confirm_title'),
      { type: 'warning' },
    );
  } catch {
    // 用户取消
    return;
  }

  try {
    crudInstance.setLoading(true);
    await removeApi(id);
    ElMessage.success(
      $t('components.crud.message.delete_success', [
        formDialogTitle.value || $t('components.crud.table.action'),
      ]),
    );
    crudInstance.refreshRemove();
  } finally {
    crudInstance.setLoading(false);
  }
}

// 批量删除
async function handleBatchDelete() {
  const rowKey = tableConfig.value.rowKey || 'id';
  const ids = readonlyState.selection.map((item: any) => item[rowKey]);

  if (ids.length === 0) {
    ElMessage.warning($t('components.crud.message.no_selection'));
    return;
  }

  try {
    await ElMessageBox.confirm(
      $t('components.crud.table.confirm_batch_delete', [
        ids.length.toString(),
        formDialogTitle.value || $t('components.crud.table.action'),
      ]),
      $t('components.crud.table.batch_delete_confirm_title'),
      { type: 'warning' },
    );
  } catch {
    // 用户取消
    return;
  }

  const pathParams = getPathParams();
  const batchRemoveApi =
    tableConfig.value.proxyConfig?.deleteBatch ||
    (mergedCrudSchema.value.crudApi as any).batchRemove;

  if (!batchRemoveApi) {
    ElMessage.error($t('components.crud.message.no_batch_delete_api'));
    return;
  }

  try {
    crudInstance.setLoading(true);
    await batchRemoveApi({ ids, ...pathParams });
    ElMessage.success(
      $t('components.crud.message.delete_success', [
        formDialogTitle.value || $t('components.crud.table.action'),
      ]),
    );
    readonlyState.selection = [];
    gridApi.grid?.clearCheckboxRow();
    crudInstance.refreshRemove();
  } finally {
    crudInstance.setLoading(false);
  }
}

// 保留原来的 handleDelete 逻辑，但区分单删和批量
function handleDelete(row: any) {
  if (row) {
    handleSingleDelete(row);
  } else {
    handleBatchDelete();
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
    const grid = gridApi.grid;
    if (!grid) return;
    const fullData = grid.getTableData()?.fullData;
    if (
      fullData?.length === 1 ||
      fullData?.length === readonlyState.selection.length
    ) {
      const proxyInfo = grid.getProxyInfo();
      if (proxyInfo?.pager && proxyInfo.pager.currentPage > 1) {
        proxyInfo.pager.currentPage -= 1;
      }
    }
    queryWithReserve();
  },

  openAddDialog: (data?: Record<string, any>) => {
    dialogFormRef.value?.openAdd(data);
  },
  openEditDialog: (row: any) => {
    dialogFormRef.value?.openEdit(row);
  },
  openViewDialog: (row: any) => {
    dialogFormRef.value?.openView(row);
  },

  removeByApi: (row: any) => {
    handleDelete(row);
  },
  executeRemove: (row: any) => {
    handleDelete(row);
  },
  executeBatchRemove: () => {
    handleBatchDelete();
  },
  setGridOptions: (options: Record<string, any>) => {
    gridApi.setGridOptions(options);
  },
};

// 创建 Grid
const [VxeGrid, gridApi] = useVbenVxeGrid({
  gridOptions: mergedGridOptions.value as any,
  gridEvents: mergedGridEvents.value as any,
  formOptions: mergedFormOptions.value,
});

emit('register', crudInstance);
defineExpose(crudInstance);
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
        <slot name="toolbar-tools" :actions="finalDropDownToolbarActions">
          <TableAction
            :actions="toolbarToolActions"
            :drop-down-actions="finalDropDownToolbarActions"
          />
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
