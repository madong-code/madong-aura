import { TableMethods, TableSchema } from '../table'
import Table from './table.vue'

export function useTable(tableSchema: TableSchema) {
  const tableRef = ref<any>(null)
  const register = (tableInstance: any) => {
    tableRef.value = tableInstance
  }
  const tableMethods: TableMethods = {
    // 获取表格实例
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
    },
    // 刷新表格数据，保留当前表单搜索条件
    reload(params?: Record<string, any>) {
      return tableRef.value?.reload(params)
    },
    // 获取art表格实例，可通过该方法来操作原生的art-table组件
    // 个人建议，可以在该文件上包装一层再暴露给外部使用，如上述的reload方法一样
    getArtTableInstance() {
      return tableRef.value?.getArtTableInstance()
    },
    // 刷新策略
    /** 全量刷新：清空所有缓存，重新获取数据（适用于手动刷新按钮） */
    refreshData() {
      return this.getArtTableInstance()?.refreshData()
    },
    /** 轻量刷新：仅清空当前搜索条件的缓存，保持分页状态（适用于定时刷新） */
    refreshSoft() {
      return this.getArtTableInstance()?.refreshSoft()
    },
    /** 新增后刷新：回到第一页并清空分页缓存（适用于新增数据后） */
    refreshCreate() {
      return this.getArtTableInstance()?.refreshCreate()
    },
    /** 更新后刷新：保持当前页，仅清空当前搜索缓存（适用于更新数据后） */
    refreshUpdate() {
      return this.getArtTableInstance()?.refreshUpdate()
    },
    /** 删除后刷新：智能处理页码，避免空页面（适用于删除数据后） */
    refreshRemove() {
      return this.getArtTableInstance()?.refreshRemove()
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
