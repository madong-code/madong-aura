/**
 * CRUD 组件类型定义
 * 提供完整的 CRUD 功能类型支持
 * 支持扁平化配置：table 配置项可直接定义在顶层
 */

import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type {
  ActionItem,
  PopConfirm,
} from '#/components/crud/components/table-action';

// Re-export ActionItem 和 PopConfirm 以确保类型一致性
export type { ActionItem, PopConfirm };

// ========== CRUD API ==========

export interface CrudApi {
  list: (params: any) => Promise<any>;
  add?: (params: any) => Promise<any>;
  edit?: (params: any) => Promise<any>;
  /** 单个删除接口 */
  remove?: (params: any) => Promise<any>;
  /** 批量删除接口（传入 ids 数组） */
  batchRemove?: (params: { ids: any[] }) => Promise<any>;
  view?: (id: any) => Promise<any>;
}

// ========== 搜索表单配置 ==========

export interface SearchFormConfig {
  /** 是否启用搜索表单，默认 true */
  enabled?: boolean;
  /** 搜索表单 schema */
  schema?: (() => VbenFormSchema[]) | VbenFormSchema[];
  /** 搜索表单通用配置 */
  commonConfig?: Partial<VbenFormProps>;
  /** 提交方式：change 时立即提交，submit 时按钮提交，默认 submit */
  submitOnChange?: boolean;
  /** 是否折叠，默认 false */
  collapsed?: boolean;
  /** 折叠时显示行数，默认 2 */
  collapsedRows?: number;
}

// ========== 表单弹窗配置 ==========

export interface FormDialogCommonConfig {
  /** label 宽度，默认 120 */
  labelWidth?: number;
  /** label 对齐方式 */
  labelAlign?: 'left' | 'right';
  /** 表单 label 对齐方式（仅表单生效） */
  formLabelAlign?: 'left' | 'right';
  /** 详情 label 对齐方式（仅详情页生效） */
  detailLabelAlign?: 'left' | 'right';
  /** label class */
  labelClass?: string;
  /** control class */
  controlClass?: string;
  /** wrapper class */
  wrapperClass?: string;
  /** 是否隐藏 label */
  hideLabel?: boolean;
  /** 是否隐藏必填标记 */
  hideRequiredMark?: boolean;
  /** 表单项 class */
  formItemClass?: (() => string) | string;
  /** 组件默认 props */
  componentProps?: Record<string, any>;
}

export type FormDialogType = 'drawer' | 'modal';

export type FormActionType = 'add' | 'edit' | 'view';

export interface FormDialogApiConfig {
  add?: (params: any) => Promise<any>;
  edit?: (params: any) => Promise<any>;
  view?: (id: any) => Promise<any>;
}

export interface FormDialogOptions extends Omit<
  Partial<VbenFormProps>,
  'schema'
> {
  schema?: (() => VbenFormSchema[]) | VbenFormSchema[];
  commonConfig?: FormDialogCommonConfig;
  api?: FormDialogApiConfig;
  dialogType?: FormDialogType;
  title?: string;
  width?: string;
  rowKey?: string;
  draggable?: boolean;
  fullscreenButton?: boolean;
  onSuccess?: (
    type: FormActionType,
    values: Record<string, any>,
  ) => Promise<void> | void;
  beforeSubmit?: (
    values: Record<string, any>,
    type: FormActionType,
  ) => false | Promise<false | Record<string, any>> | Record<string, any>;
  onOpen?: (
    type: FormActionType,
    data: Record<string, any>,
  ) => Promise<void> | void;
  confirmText?: string;
  cancelText?: string;
  transformFormValues?: (
    values: Record<string, any>,
    type: FormActionType,
  ) => Record<string, any>;
}

export interface FormDialogConfig {
  /** 是否启用表单弹窗，默认 true */
  enabled?: boolean;
  /** 表单 schema */
  schema?: (() => VbenFormSchema[]) | VbenFormSchema[];
  /** 表单通用配置 */
  commonConfig?: FormDialogCommonConfig;
  /** API 接口配置 */
  api?: FormDialogApiConfig;
  /** 弹窗类型，默认 modal */
  dialogType?: FormDialogType;
  /** 弹窗标题前缀 */
  title?: string;
  /** 弹窗宽度 */
  width?: string;
  /** 表单布局 */
  layout?: 'horizontal' | 'inline' | 'vertical';
  /** Grid 布局 class，用于控制表单列数，如 'grid-cols-1' 一列，'grid-cols-2' 两列，'grid-cols-3' 三列 */
  wrapperClass?: string;
  /** 行数据的 key 字段，默认 id */
  rowKey?: string;
  /** 是否可拖拽（仅 modal 有效），默认 true */
  draggable?: boolean;
  /** 是否显示全屏按钮，默认 true */
  fullscreenButton?: boolean;
  /** 弹窗组件的 CSS class，如 'top-0' 让弹窗靠顶部显示 */
  class?: string;
  /** 弹窗层级，默认 undefined（使用组件默认值），嵌套使用时需设更高值 */
  zIndex?: number;
  /** 提交成功回调 */
  onSuccess?: (
    type: FormActionType,
    values: Record<string, any>,
  ) => Promise<void> | void;
  /** 提交前回调 */
  beforeSubmit?: (
    values: Record<string, any>,
    type: FormActionType,
  ) => false | Promise<false | Record<string, any>> | Record<string, any>;
  /** 提交前数据转换 */
  transformFormValues?: (
    values: Record<string, any>,
    type: FormActionType,
  ) => Record<string, any>;
  /** 打开弹窗后的回调 */
  onOpen?: (
    type: FormActionType,
    data: Record<string, any>,
  ) => Promise<void> | void;
  /** 自定义确认文本 */
  confirmText?: string;
  /** 自定义取消文本 */
  cancelText?: string;
}

// ========== CRUD Schema ==========
// 扁平化配置：所有表格配置项直接定义在顶层

export interface CrudSchema extends Partial<TableConfig> {
  // --- API 接口 ---
  /** API 接口 */
  crudApi: CrudApi;

  // --- 旧版扁平配置兼容 ---
  /** @deprecated 请使用 formDialog.title */
  dialogTitle?: string;
  /** @deprecated 请使用 formDialog.dialogType */
  dialogType?: FormDialogType;
  /** @deprecated 请使用 formDialog.width */
  dialogWidth?: string;
  /** @deprecated 请使用 formDialog.enabled */
  useCrud?: boolean;
  /** @deprecated 请使用 searchForm.enabled */
  useSearchForm?: boolean;
  /** @deprecated 请使用 searchForm.schema */
  searchFormSchema?: (() => VbenFormSchema[]) | VbenFormSchema[];
  /** @deprecated 请使用 formDialog.schema */
  formSchema?: (() => VbenFormSchema[]) | VbenFormSchema[];
  /** @deprecated 请使用 toolbar */
  toolbarConfig?: Record<string, any> & ToolbarConfig;

  // --- 表格列定义 ---
  /** 表格列定义 */
  columns?: (() => CrudColumn[]) | CrudColumn[];

  // --- 数据处理配置 ---
  /** 请求前处理参数 */
  beforeFetch?: (params: any) => any;
  /** 请求后处理结果 */
  afterFetch?: (res: any) => any;

  // --- 搜索表单配置 ---
  /** 搜索表单配置 */
  searchForm?: SearchFormConfig;

  // --- 表单弹窗配置 ---
  /** 表单弹窗配置 */
  formDialog?: FormDialogConfig;
}

// ========== 状态和 API ==========

export interface CrudReadonlyState {
  selection: any[];
}

export interface CrudApiInstance {
  // 数据操作
  query: (params?: Record<string, any>) => Promise<void>;
  reload: (params?: Record<string, any>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  getGridInstance: () => any;
  getFormApi: () => any;
  getRowSelection: () => any[];
  getReadonlyState: () => CrudReadonlyState;
  refreshData: () => void;
  refreshSoft: () => void;
  refreshCreate: () => void;
  refreshUpdate: () => void;
  refreshRemove: () => void;

  // 弹窗操作
  openAddDialog: (data?: Record<string, any>) => void;
  openEditDialog: (row: any) => void;
  openViewDialog: (row: any) => void;

  // 删除操作
  removeByApi: (row: any) => void;
  executeRemove: (row: any) => void;
  executeBatchRemove: () => void;

  /** 动态更新 VxeGrid 选项（如 height） */
  setGridOptions: (options: Record<string, any>) => void;
}

// ========== 表格相关类型定义 ==========

/**
 * 分页配置
 */
export interface PaginationConfig {
  /** 当前页字段名，默认 page */
  currentKey?: string;
  /** 每页大小字段名，默认 limit */
  sizeKey?: string;
}

/**
 * 树形结构配置
 */
export interface TreeConfig {
  /** 父级 ID 字段名，默认 parentId */
  pid?: string;
  /** ID 字段名，默认 id */
  id?: string;
  /** 子节点字段名，默认 children */
  children?: string;
  /** 刷新后是否保持展开状态，默认 false */
  reserve?: boolean;
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 是否显示刷新按钮 */
  refresh?: boolean;
  /** 是否显示自定义按钮区域 */
  custom?: boolean;
  /** 是否显示缩放按钮 */
  zoom?: boolean;
  /** 是否显示导出按钮 */
  export?: boolean;
  /** 是否显示搜索按钮 */
  search?: boolean;
  /** 是否显示打印按钮 */
  print?: boolean;
  /** 自定义工具按钮 */
  tools?: any[];
}

/**
 * 表格代理配置
 */
export interface TableProxyConfig {
  /** 查询接口 */
  query?: (params: any) => Promise<any>;
  /** 创建接口 */
  create?: (params: any) => Promise<any>;
  /** 更新接口 */
  update?: (params: any) => Promise<any>;
  /** 删除接口 */
  delete?: (params: any) => Promise<any>;
  /** 批量删除接口 */
  deleteBatch?: (params: { ids: any[] }) => Promise<any>;
  /** 获取详情接口 */
  get?: (id: any) => Promise<any>;
}

/**
 * 表格权限配置
 */
export interface TablePermissionConfig {
  /** 新增权限 */
  add?: string;
  /** 编辑权限 */
  edit?: string;
  /** 删除权限 */
  remove?: string;
  /** 查看权限 */
  view?: string;
}

/**
 * 表格按钮文本配置
 */
export interface TableButtonTextConfig {
  /** 新增按钮文本 */
  add?: string;
  /** 编辑按钮文本 */
  edit?: string;
  /** 删除按钮文本 */
  remove?: string;
  /** 查看按钮文本 */
  view?: string;
}

/**
 * 表格列配置
 */
export interface CrudColumn {
  /** 字段名 */
  field?: string;
  /** 显示标题 */
  title?: string;
  /** 宽度 */
  width?: number | string;
  /** 最小宽度 */
  minWidth?: number | string;
  /** 类型 */
  type?: 'checkbox' | 'expand' | 'radio' | 'seq' | string;
  /** 是否可见 */
  visible?: boolean;
  /** 对齐方式 */
  align?: 'center' | 'left' | 'right';
  /** 权限标识 */
  auth?: string;
  /** 自定义单元格渲染 */
  cellRender?: {
    attrs?: Record<string, any>;
    name: string;
    props?: Record<string, any>;
  };
  /** 自定义查看组件 */
  viewComponent?: any;
  /** 查看组件属性 */
  viewComponentProps?: Record<string, any>;
  /** 自定义列配置 */
  vxeColumn?: Record<string, any>;
  /** 其他属性 */
  [key: string]: any;
}

/**
 * 路径参数配置项
 */
export interface PathParamItem {
  /** 参数键名 */
  key: string;
  /** 参数来源：row（行数据）或 route（路由参数） */
  source: 'route' | 'row';
  /** 当 source 为 row 时，指定行数据的字段名 */
  field?: string;
  /** 当 source 为 route 时，指定路由参数的键名（默认使用 key） */
  routeKey?: string;
}

/**
 * 表格配置
 */
export interface TableConfig {
  /** 行数据的 key 字段，默认 id */
  rowKey?: string;
  /** 路径参数配置，用于在请求时携带额外参数 */
  pathParams?: PathParamItem[];
  /** 是否显示新增按钮 */
  hasAdd?: boolean;
  /** 是否显示编辑按钮 */
  hasEdit?: boolean;
  /** 是否显示删除按钮 */
  hasRemove?: boolean;
  /** 是否显示详情按钮 */
  hasView?: boolean;
  /** 是否显示批量删除按钮 */
  hasBatchRemove?: boolean;
  /** 操作按钮权限配置 */
  permissions?: TablePermissionConfig;
  /** 表格列定义 */
  columns?: (() => CrudColumn[]) | CrudColumn[];
  /** 请求前处理参数 */
  beforeFetch?: (params: any) => any;
  /** 请求后处理结果 */
  afterFetch?: (res: any) => any;
  /** 表格行操作按钮 */
  tableActions?: ActionItem[];
  /** 表格行下拉操作 */
  dropDownActions?: ActionItem[];
  /** 工具栏操作按钮 */
  toolbarActions?: ActionItem[];
  /** 工具栏下拉操作按钮 */
  dropDownToolbarActions?: ActionItem[];
  /** 行操作列配置 */
  tableActionColumn?: Partial<CrudColumn>;
  /** 分页配置 */
  pagination?: PaginationConfig;
  /** 树形结构配置 */
  tree?: TreeConfig;
  /** 工具栏配置 */
  toolbar?: ToolbarConfig;
  /** 表格代理配置 */
  proxyConfig?: TableProxyConfig;
  /** 按钮文本配置 */
  buttonText?: TableButtonTextConfig;
  /** 是否显示边框 */
  border?: boolean;
  /** 是否显示斑马纹 */
  stripe?: boolean;
  /** 是否高亮当前行 */
  highlightCurrentRow?: boolean;
  /** 是否高亮悬停列 */
  highlightHoverColumn?: boolean;
  /** 是否显示溢出提示 */
  showOverflow?: 'ellipsis' | 'tooltip' | boolean;
  /** 是否支持多选 */
  checkable?: boolean;
  /** 多选列宽度 */
  checkboxColumnWidth?: number;
  /** 序号列宽度 */
  seqColumnWidth?: number;
  /** 表格高度 */
  height?: number | string;
  /** 是否保持数据源 */
  keepSource?: boolean;
  /** 悬停行高亮 */
  hoverRow?: boolean;
  /** 分页配置 */
  pagerConfig?: boolean | Record<string, any>;
  /** 排序配置 */
  sortConfig?: Record<string, any>;
  /** 过滤配置 */
  filterConfig?: Record<string, any>;
  /** 导出配置 */
  exportConfig?: Record<string, any>;
  /** 右键菜单配置 */
  contextMenuConfig?: Record<string, any>;
  /** 垂直滚动配置 */
  scrollY?: number | string;
}
