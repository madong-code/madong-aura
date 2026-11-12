/**
 * 通用「实体选择器包装器」契约（框架层通用实现）。
 *
 * 设计原则：外层壳（selector-shell.vue）只负责通用逻辑与样式；
 * 内部内容（搜索区、表格、分页、底部操作、空态）全部由使用方通过插槽定义。
 * 因此本文件只描述「壳需要向内部内容提供什么状态与操作」，不绑定任何实体字段或接口。
 *
 * 同一套壳可用于选用户、选角色、选部门、选职位以及任何业务实体；
 * 新增实体只需新增 preset / 配置，不改壳。
 */
import type { Slots } from 'vue';

/** 选择模式：默认 single（单选），显式传 multiple 才开启多选 */
export type SelectMode = 'multiple' | 'single';

/** 弹层形态 */
export type SelectorDisplay = 'dialog' | 'popover';

/** 通用列定义（vxe 列格式的轻量子集） */
export interface SelectorColumn {
  /** 字段名（type 列可省略） */
  field?: string;
  title?: string;
  /** vxe 内置列类型 */
  type?: 'checkbox' | 'expand' | 'radio' | 'seq';
  width?: number;
  minWidth?: number;
  align?: 'center' | 'left' | 'right';
  fixed?: 'left' | 'right';
  showOverflow?: 'ellipsis' | 'tooltip' | boolean;
  formatter?: (params: any) => any;
  /** 单元格插槽：{ default: 'slotName' } */
  slots?: Record<string, string>;
  sortable?: boolean;
  [key: string]: any;
}

export interface SelectorSearchField {
  label: string;
  value: string;
}

export interface SelectorFetchParams {
  page: number;
  limit: number;
  /** 已 trim 的关键词，空串表示不筛选；指向当前活动字段（向后兼容单字段模式） */
  keyword: string;
  /** 当前搜索字段，来自 searchFields[].value */
  field: string;
  /**
   * 多字段检索条件（field → 关键词，已过滤空值，AND 语义一起下发）。
   * single 模式仅含活动字段一项；multi 模式含全部非空字段条件。
   * 兼容约定：仅按 keyword/field 取数的旧 fetcher 无需感知此字段。
   */
  filters?: Record<string, string>;
  /**
   * 使用方经壳 fetchExtra 透传的业务固定参数。
   * 内置选择器约定：extra.deptIds 为限定部门 id 集合（已含子部门），
   * extra.deptRootIds 为使用方原始传入的部门范围。
   */
  extra?: Record<string, any>;
}

export interface SelectorFetchResult {
  items: any[];
  total: number;
}

/** 服务端分页取数；由使用方拼装自己的查询参数，壳不绑定任何接口 */
export type SelectorFetcher = (
  params: SelectorFetchParams,
) => Promise<SelectorFetchResult>;

/** 详情反查双形态：标准 REST 详情路径模板（字符串，如 '/xxx/:id'）或自定义反查函数 */
export type EntityHydrate = ((id: string) => Promise<any | null>) | string;

export interface SelectorItem {
  id: string;
  label: string;
}

/** 使用方声明的实体配置，壳仅原样透传给 slot props */
export interface SelectorConfig {
  columns: SelectorColumn[];
  fetcher: SelectorFetcher;
  searchFields?: SelectorSearchField[];
  labelOf?: (row: any) => string;
  hydrate?: (id: string) => Promise<any | null>;
  rowKey?: string;
}

/**
 * 壳通过具名插槽暴露给使用方内部内容的状态与操作。
 * 使用方据此完全自定义 search / content / footer / empty 的渲染。
 */
export interface SelectorSlotProps {
  // 展示与数据
  display: SelectorDisplay;
  selectMode: SelectMode;
  loading: boolean;
  rows: any[];
  total: number;
  page: number;
  pageSize: number;
  keyword: string;
  searchField: string;
  searchFields: SelectorSearchField[];
  /** 搜索模式：single 单字段下拉 + 关键词（默认）/ multi 多字段独立输入 */
  searchMode: 'single' | 'multi';
  /** 各检索字段当前关键词（multi 模式逐字段输入绑定；含空值原文） */
  filters: Record<string, string>;
  columns: SelectorColumn[];
  rowKey: string;
  tableHeight: number;
  activeIds: string[];
  activeItems: SelectorItem[];
  activeLabel: string;
  emptyText: string;
  disabled: boolean;
  /** 壳收到的非结构插槽（单元格渲染），交由内容块透传到表格 */
  cellSlots: Slots;
  // 检索与分页
  setKeyword: (value: string) => void;
  setSearchField: (value: string) => void;
  /** multi 模式：设置某检索字段的关键词（field → 关键词） */
  setFilter: (field: string, value: string) => void;
  keywordInput: () => void;
  search: () => void;
  reset: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  // 选择
  toggleRow: (row: any) => void;
  isSelected: (row: any) => boolean;
  removeItem: (id: string, event?: Event) => void;
  clear: () => void;
  // 弹层
  done: () => void;
  cancel: () => void;
  confirm: () => void;
  canConfirm: boolean;
}

/** 内置实体类型标识（统一调用入口 entity-selector 的 type 取值） */
export type EntitySelectorType = 'dept' | 'post' | 'role' | 'user';

/** 内置选择器取数上下文：统一入口按部门联动范围计算后经 fetchExtra 透传 */
export interface EntityFetchContext {
  /** 限定部门 id 集合（已展开全部子部门）；空数组表示不限定 */
  deptIds: string[];
  /** 使用方原始传入的部门范围（未展开子级） */
  deptRootIds: string[];
}

/** 内置选择器的实体配置（configs/ 下按类型登记，entity-picker 通用渲染） */
export interface EntityPickerConfig {
  /** 实体类型标识：内置类型或插件经 registerEntityPickerConfig 注册的自定义标识 */
  type: EntitySelectorType | string;
  /** 弹窗标题 */
  title: string;
  /** 触发区占位文案 */
  placeholder?: string;
  columns: SelectorColumn[];
  searchFields: SelectorSearchField[];
  /**
   * 取数双形态：
   * - 字符串（推荐）：标准 CRUD 列表接口路径，GET + { page, limit, LIKE_<field>, IN_dept_id }，
   *   响应 { items, total }（非分页返回数组亦可）；
   * - 函数：非标准契约（参数组装 / 多接口聚合 / 自定义过滤），第二参数为部门联动上下文。
   * 字符串形态在消费边界由 resolveEntityApi 归一化为函数。
   */
  fetcher: SelectorFetcher | string;
  /**
   * 仅有 id 时反查实体（编辑回显 / 只读详情文案 / 部门联动强校验），双形态：
   * - 字符串（推荐）：标准 REST 详情路径模板 '/xxx/:id'（占位替换）或 '/xxx'（末尾拼接 id），
   *   响应实体行，失败返回 null；
   * - 函数：自定义反查。
   */
  hydrate?: EntityHydrate;
  labelOf?: (row: any) => string;
  rowKey?: string;
  /** 搜索模式：single 单字段下拉 + 关键词（默认）/ multi 多字段独立输入（非空条件 AND 下发） */
  searchMode?: 'single' | 'multi';
  /** 实体上的部门外键字段名（参与部门联动强校验），无则不参与 */
  deptField?: string;
}
