import { ActionItem, TableAction } from '../table-action'
import { viewColumnFormatter } from '../view/component-map'
import { CrudSchema } from './types'

export function useColumns(
  crudSchemaRef: Ref<CrudSchema>,
  tableActions: Ref<ActionItem[]>,
  dropDownActions: Ref<ActionItem[]>,
  handleActionItemClick: (record: any) => void
) {
  if (crudSchemaRef.value?.useVxeTable) {
    const columns =
      (typeof crudSchemaRef.value.columns === 'function'
        ? crudSchemaRef.value.columns()
        : crudSchemaRef.value.columns) || []
    const vxeTableColumns = columns.map((column) => {
      return {
        type: column.type === 'selection' ? 'checkbox' : column.type,
        field: column.prop,
        title: column.label,
        align: column.align,
        width: column.type === 'selection' ? 60 : column.width,
        showOverflow: 'tooltip',
        cellRender: {
          name: column.component,
          props: column.componentProps
        },
        ...column.vxeColumn
      }
    })
    // 有操作列配置才添加操作列
    if (
      (tableActions.value && tableActions.value.length > 0) ||
      (dropDownActions.value && dropDownActions.value.length > 0)
    ) {
      // @ts-nocheck 如果想忽略整个文件检查可使用此注释
      vxeTableColumns.push({
        type: 'default',
        field: '__ACTION__',
        title: '操作',
        width: 220,
        align: 'center',
        showOverflow: 'tooltip', // 显式定义以避免类型错误
        slots: {
          default: ({ row }: { row: any }) => {
            return (
              <TableAction
                onActionItemClick={handleActionItemClick}
                record={row}
                actions={tableActions.value}
                dropDownActions={dropDownActions.value}
              />
            )
          }
        },

        ...crudSchemaRef.value.tableActionColumn?.vxeColumn
      } as any)
    }
    return { columns: vxeTableColumns }
  }
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
  return {
    columns
  }
}
