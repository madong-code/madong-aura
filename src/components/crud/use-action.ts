import { ActionItem } from '../table-action'
import { CrudMethods, CrudSchema } from './types'

export function useAction(
  crudSchema: CrudSchema,
  dialogFormRef: Ref<any>,
  crudMethods: CrudMethods
) {
  // 左侧栏工具，默认有新增按钮
  const toolbarActions = computed(() => {
    const actions: ActionItem[] = []
    if (crudSchema.useCrud === true && crudSchema.hasAdd !== false) {
      actions.push({
        label: crudSchema.addButtonText || '新增',
        type: 'primary',
        icon: 'ant-design:plus-outlined',
        auth: crudSchema.addAuth,
        dialogRef: dialogFormRef,
        dialogParams: {
          isUpdate: false,
          getCrudApi: () => crudMethods,
          type: 'add'
        }
      })
    }
    actions.push(...(crudSchema.toolbarActions || []))
    return actions
  })
  // 左侧栏工具-下拉菜单，默认有删除按钮
  const dropDownToolbarActions = computed(() => {
    const actions: ActionItem[] = []
    if (crudSchema.useCrud === true && crudSchema.hasAdd !== false) {
      actions.push({
        label: '批量删除',
        type: 'danger',
        icon: 'ant-design:delete-outlined',
        auth: crudSchema.removeAuth,
        ifShow: () => crudMethods.getReadonlyState().selection.length > 0,
        confirm: {
          title: '提示',
          content: '确定批量删除吗？',
          ok() {
            crudMethods.removeByApi({})
          }
        }
      })
    }
    actions.push(...(crudSchema.dropDownToolbarActions || []))
    return actions
  })
  // 行操作-默认有详情、编辑
  const tableActions = computed(() => {
    const actions: ActionItem[] = []
    if (crudSchema.useCrud === true && crudSchema.hasView !== false) {
      actions.push({
        label: crudSchema.viewButtonText || '详情',
        type: 'primary',
        link: true,
        icon: 'ant-design:eye-outlined',
        auth: crudSchema.viewAuth,
        dialogRef: dialogFormRef,
        dialogParams() {
          return {
            getCrudApi: () => crudMethods
          }
        }
      })
    }
    if (crudSchema.useCrud === true && crudSchema.hasEdit !== false) {
      actions.push({
        label: crudSchema.editButtonText || '编辑',
        type: 'primary',
        link: true,
        icon: 'ant-design:edit-outlined',
        auth: crudSchema.editAuth,
        dialogRef: dialogFormRef,
        dialogParams: {
          isUpdate: true,
          type: 'edit',
          getCrudApi: () => crudMethods
        }
      })
    }
    actions.push(...(crudSchema.tableActions || []))
    return actions
  })
  // 行操作-下拉菜单默认有删除按钮，树形表格默认添加子节点按钮
  const dropDownActions = computed(() => {
    const actions: ActionItem[] = []
    if (crudSchema.useCrud === true && crudSchema.hasAdd !== false) {
      // 判断一下是否则为树结构
      if (crudSchema.tree) {
        actions.push({
          label: (crudSchema.addButtonText || '新增') + '子节点',
          icon: 'ant-design:plus-outlined',
          size: 'small',
          auth: crudSchema.addAuth,
          dialogRef: dialogFormRef,
          dialogParams: {
            isUpdate: true,
            type: 'add',
            tree: crudSchema.tree,
            getCrudApi: () => crudMethods
          }
        })
      }
    }
    if (crudSchema.useCrud === true && crudSchema.hasRemove !== false) {
      actions.push({
        label: crudSchema.removeButtonText || '删除',
        type: 'danger',
        icon: 'ant-design:delete-outlined',
        size: 'small',
        auth: crudSchema.removeAuth,
        confirm: {
          title: '提示',
          content: '确定删除吗？',
          ok(record: any) {
            crudMethods.removeByApi(record)
          }
        }
      })
    }
    actions.push(...(crudSchema.dropDownActions || []))
    return actions
  })
  return {
    toolbarActions,
    dropDownToolbarActions,
    tableActions,
    dropDownActions
  }
}
