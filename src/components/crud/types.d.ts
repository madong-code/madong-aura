import { MyDialogProps } from '../dialog'
import { FormSchema } from '../form'
import { ActionItem } from '../table-action'
export interface CrudSchema {
  // 行id
  rowKey?: string
  // 请求接口
  api?: ((params: any) => Promise<any>) | string
  // 请求方法
  requestMethod?: 'get' | 'post'
  // 是否立即加载数据
  immediate?: boolean
  data?: any
  // 树型配置
  tree?: {
    // 树形id字段名
    id?: string
    // 树形pid字段名
    pid?: string
    // 树形children字段名
    children?: string
  }
  // 右侧工具栏
  toolbarConfig?: {
    // 是否显示刷新按钮
    refresh?: boolean
    // 是否显示大小按钮
    size?: boolean
    // 是否显示全屏按钮
    fullscreen?: boolean
    // 是否显示列设置按钮
    columns?: boolean
    // 是否显示列设置按钮
    settings?: boolean
    // 表格右上工具栏，在左侧追加
    tools?: ActionItem[]
  }
  // 列定义
  columns?: CrudColumn[]
  // 是否显示搜索表单
  useSearchForm?: boolean
  // 搜索表单配置
  searchFormSchema?: FormSchema
  // crud表单配置
  formSchema?: FormSchema
  // 操作列-按钮定义
  tableActions?: ActionItem[]
  // 操作列-下拉菜单定义
  dropDownActions?: ActionItem[]
  // 操作列配置
  tableActionColumn?: CrudColumn
  // 左侧栏工具配置
  toolbarActions?: ActionItem[]
  // 左侧栏-下拉菜单定义
  dropDownToolbarActions?: ActionItem[]
  // 内置弹窗配置
  dialogProps?: MyDialogProps
  // 增删改查接口
  crudApi?: CrudApi
  // 是否使用crud
  useCrud?: boolean
  // 模块名
  dialogTitle?: string
  // 是否有新增
  hasAdd?: boolean
  // 新增按钮文本
  addButtonText?: string
  // 新增按钮权限编码
  addAuth?: string
  // 是否有编辑
  hasEdit?: boolean
  // 编辑按钮文本
  editButtonText?: string
  // 编辑按钮权限编码
  editAuth?: string
  // 是否有详情
  hasView?: boolean
  // 详情按钮文本
  viewButtonText?: string
  // 详情按钮权限编码
  viewAuth?: string
  // 是否有删除
  hasRemove?: boolean
  // 删除按钮文本
  removeButtonText?: string
  // 删除按钮权限编码
  removeAuth?: string
  // 转换表单值的函数，可用于添加隐藏字段、格式化数据等
  transformFormValues?: (values: Record<string, any>, type: 'add' | 'edit') => Record<string, any>
}
// 表格列配置接口
export interface CrudColumn<T = any> {
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
export interface CrudApi {
  add?: (params: any) => Promise<any>
  edit?: (params: any) => Promise<any>
  remove?: (params: any) => Promise<any>
  view?: (params: any) => Promise<any>
}
// 只读配置
export interface CrudReadonlyState {
  selection: []
}
// 表格基础方法，和tableRef和tableApi相同的方法
export interface CrudBaseMethods {
  // 重新加载数据
  reload: (params?: Record<string, any>) => Promise<any>
  // 设置组件状态（props）
  setState: (state: CrudSchema) => Promise<void>
  // 获取组件状态（props）
  getState: () => Promise<CrudSchema>
  // 获取勾选行信息
  getRowSelection: () => []
  // 获取只读状态信息
  getReadonlyState: () => CrudReadonlyState
  // 获取art table实例
  getArtTableInstance: () => any
  // 通过接口删除行
  removeByApi: (row: any) => void
  // 打开内置新增表单
  openAddDialog: () => void
  // 打开内置修改表单
  openEditDialog: () => void
  // 打开内置详情表单
  openViewDialog: () => void
  // 执行内置的删除方法
  executeRemove: () => void
}
export type CrudInstance = CrudBaseMethods
// 定义表格方法接口，提供更好的类型提示
export interface CrudMethods extends CrudBaseMethods {
  // 获取crud实例
  getCrudRef(): any
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
