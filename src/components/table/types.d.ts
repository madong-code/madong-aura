import { FormSchema } from '../form'
import { ActionItem } from '../table-action'
export interface TableSchema {
  // 行id
  rowKey?: string
  // 请求接口
  api: ((params: any) => Promise<any>) | string
  // 请求方法
  requestMethod?: 'get' | 'post'
  // 列定义
  columns: TableColumn[]
  // 是否显示搜索表单
  useSearchForm?: boolean
  // 搜索表单配置
  searchFormSchema?: FormSchema
  // 操作列-按钮定义
  tableActions?: ActionItem[]
  // 操作列-下拉菜单定义
  dropDownActions?: ActionItem[]
  // 操作列配置
  tableActionColumn?: TableColumn
}
// 表格列配置接口
export interface TableColumn<T = any> {
  // 列类型
  type?: 'selection' | 'expand' | 'index' | 'globalIndex'
  // 列属性名
  prop?: string
  // 列标题
  label?: string
  // 列宽度
  width?: string | number
  // 最小列宽度
  minWidth?: string | number
  // 固定列
  fixed?: boolean | 'left' | 'right'
  // 是否可排序
  sortable?: boolean
  // 过滤器选项
  filters?: any[]
  // 过滤方法
  filterMethod?: (value: any, row: any) => boolean
  // 过滤器位置
  filterPlacement?: string
  // 是否禁用
  disabled?: boolean
  // 是否选中显示（可用于隐藏列）
  checked?: boolean
  // 自定义渲染函数
  formatter?: (row: T) => any
  // 插槽相关配置
  // 是否使用插槽渲染内容
  useSlot?: boolean
  // 插槽名称（默认为 prop 值）
  slotName?: string
  // 是否使用表头插槽
  useHeaderSlot?: boolean
  // 表头插槽名称（默认为 `${prop}-header`）
  headerSlotName?: string
  // 其他属性
  [key: string]: any
  // 列回显组件
  component?: string
  // 列回显组件属性
  componentProps?: Record<string, any>
}
export interface TableInstance {
  // 重新加载数据
  reload: (params?: Record<string, any>) => Promise<any>
  // 设置组件状态（props）
  setState: (state: TableSchema) => Promise<void>
  // 获取组件状态（props）
  getState: () => Promise<TableSchema>
  getArtTableInstance: () => any
}
// 定义表格方法接口，提供更好的类型提示
export interface TableMethods {
  // 获取表单实例
  getTableRef(): any
  // 设置组件状态（props）
  setState(state: any): void
  // 获取组件状态
  getState(): any
  // 刷新表格数据，保留当前表单搜索条件
  reload(params?: Record<string, any>): void
  // 获取art表格实例，可通过该方法来操作原生的art-table组件
  getArtTableInstance(): any
  // 刷新策略
  /** 全量刷新：清空所有缓存，重新获取数据（适用于手动刷新按钮） */
  refreshData(): void
  /** 轻量刷新：仅清空当前搜索条件的缓存，保持分页状态（适用于定时刷新） */
  refreshSoft(): void
  /** 新增后刷新：回到第一页并清空分页缓存（适用于新增数据后） */
  refreshCreate(): void
  /** 更新后刷新：保持当前页，仅清空当前搜索缓存（适用于更新数据后） */
  refreshUpdate(): void
  /** 删除后刷新：智能处理页码，避免空页面（适用于删除数据后） */
  refreshRemove(): void
}
