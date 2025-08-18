import { TableSchema } from '../table'
import Table from './table.vue'

export function useTable(tableSchema: TableSchema) {
  const tableRef = ref<any>(null)
  const register = (tableInstance: any) => {
    tableRef.value = tableInstance
  }
  const tableMethods = {
    // 获取表单实例
    getTableRef() {
      return tableRef.value
    },
    // 设置组件状态（props）
    setState(state: any) {
      return tableRef.value?.setState(state)
    },
    // 获取组件状态
    getState() {
      return tableRef.value?.getState()
    }
  }

  // 创建表单组件的配置
  const TableComponent = defineComponent({
    setup(_, { attrs, slots }) {
      return () =>
        h(
          Table,
          {
            ...attrs,
            tableSchema: tableSchema,
            onRegister: register
          },
          slots
        )
    }
  })

  return [TableComponent, tableMethods] as const
}
