import { ActionItem } from '../table-action'
import { TableMethods, TableSchema } from './types'

export function useAction(
  tableSchema: TableSchema,
  dialogFormRef: Ref<any>,
  tableMethods: TableMethods
) {
  // 左侧栏工具，默认有新增按钮
  const toolbarActions = computed(() => {
    const actions: ActionItem[] = []
    if (tableSchema.useCrud === true && tableSchema.hasAdd !== false) {
      actions.push({
        label: tableSchema.addButtonText || '新增',
        type: 'primary',
        icon: '&#xe83e;',
        auth: tableSchema.addAuth,
        dialogRef: dialogFormRef,
        dialogParams: {
          isUpdate: false,
          getTableApi: () => tableMethods,
          type: 'add'
        }
      })
    }
    actions.push(...(tableSchema.toolbarActions || []))
    return actions
  })
  // 左侧栏工具-下拉菜单，默认有删除按钮
  const dropDownToolbarActions = computed(() => {
    const actions: ActionItem[] = []
    if (tableSchema.useCrud === true && tableSchema.hasAdd !== false) {
      actions.push({
        label: '批量删除',
        type: 'danger',
        icon: '&#xe783;',
        auth: 'sys:user:remove',
        ifShow: () => tableMethods.getReadonlyState().selection.length > 0,
        confirm: {
          title: '提示',
          content: '确定批量删除吗？',
          ok() {
            tableMethods.removeByApi({})
          }
        }
      })
    }
    actions.push(...(tableSchema.dropDownToolbarActions || []))
    return actions
  })
  // 行操作-默认有详情、编辑
  const tableActions = computed(() => {
    const actions: ActionItem[] = []
    if (tableSchema.useCrud === true && tableSchema.hasView !== false) {
      actions.push({
        label: tableSchema.viewButtonText || '详情',
        type: 'primary',
        link: true,
        size: 'small',
        auth: tableSchema.viewAuth,
        dialogRef: dialogFormRef,
        dialogParams() {
          return {
            getTableApi: () => tableMethods
          }
        }
      })
    }
    if (tableSchema.useCrud === true && tableSchema.hasEdit !== false) {
      actions.push({
        label: tableSchema.editButtonText || '编辑',
        type: 'primary',
        link: true,
        size: 'small',
        auth: tableSchema.editAuth,
        dialogRef: dialogFormRef,
        dialogParams: {
          isUpdate: true,
          type: 'edit',
          getTableApi: () => tableMethods
        }
      })
    }
    actions.push(...(tableSchema.tableActions || []))
    return actions
  })
  const dropDownActions = computed(() => {
    const actions: ActionItem[] = []
    if (tableSchema.useCrud === true && tableSchema.hasAdd !== false) {
      actions.push({
        label: tableSchema.removeButtonText || '删除',
        type: 'danger',
        icon: '&#xe783;',
        size: 'small',
        auth: tableSchema.removeAuth,
        confirm: {
          title: '提示',
          content: '确定删除吗？',
          ok(record: any) {
            tableMethods.removeByApi(record)
          }
        }
      })
    }
    actions.push(...(tableSchema.dropDownActions || []))
    return actions
  })
  return {
    toolbarActions,
    dropDownToolbarActions,
    tableActions,
    dropDownActions
  }
}
