/**
 * 详情查看器（viewer）统一类型与契约声明。
 *
 * ## 目录约定（所有查看器组件必须遵守）
 * 1. 目录：`viewer/components/<name>/index.vue`，由 component-map 自动扫描
 *    注册为 `Read<Name>`（目录名 kebab-case → PascalCase）。
 * 2. 入参：必须兼容 `ViewerCommonProps`（value / fieldName / schema / data），
 *    可通过 `withDefaults(defineProps<...>, {...})` 扩展自有配置项。
 * 3. 空值：所有组件对 null / undefined / '' / 空数组 必须渲染 `--` 占位，
 *    统一使用 `isEmptyValue` 判断（见 ../format）。
 * 4. 样式：根节点类名 `reader-<name>`；空值占位类名 `empty-value`；
 *    颜色使用 Element Plus CSS 变量，不硬编码色值。
 * 5. 状态：异步取数的组件必须具备 loading / error 兜底（参考 api-* 组件），
 *    禁止抛出未捕获异常（viewer.vue 有 ErrorBoundary 兜底，但组件应自查）。
 * 6. 事件：查看器为只读展示，除 `copy`（文本复制成功）外不约定其他事件。
 */
import type { VbenFormSchema } from '#/adapter/form';

/** 查看器组件统一入参（value 为唯一必关心，其余为上下文辅助） */
export interface ViewerCommonProps {
  /** 字段值（唯一数据来源） */
  value: any;
  /** 所属字段名（可用于行内联动等场景） */
  fieldName?: string;
  /** 当前字段完整 schema（可读取 componentProps / viewComponentProps 配置） */
  schema?: VbenFormSchema;
  /** 整行数据（跨字段联动展示时使用） */
  data?: Record<string, any>;
}

/** 支持的自动格式化类型 */
export type ViewerFormatType =
  | 'amount'
  | 'date'
  | 'datetime'
  | 'enum'
  | 'json'
  | 'text';

/** 枚举选项（label 展示值，color 可选 Tag 颜色） */
export interface ViewerEnumOption {
  color?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
  label: string;
  value: number | string;
}

/** 金额格式化配置 */
export interface ViewerAmountOptions {
  /** 是否千分位分隔，默认 true */
  separator?: boolean;
  /** 货币/单位前缀，如 ¥、$，默认无 */
  prefix?: string;
  /** 小数位精度，默认 2 */
  precision?: number;
  /** 后缀单位，如 元、万，默认无 */
  suffix?: string;
}

/** 日期格式化配置（dayjs format） */
export interface ViewerDateOptions {
  format?: string;
}

/** 格式化扩展配置（挂载于 schema.viewComponentProps 或 componentProps） */
export interface ViewerFormatOptions {
  amount?: ViewerAmountOptions;
  date?: ViewerDateOptions;
  /** 枚举映射（数组或键值对象二选一） */
  enum?: ViewerEnumOption[] | Record<number | string, string>;
  /** 长文本截断长度（超出省略显示，完整内容 title 提示），0 不截断 */
  textLimit?: number;
}

/** 详情查看器整体入参（DetailViewer） */
export interface DetailViewerProps {
  /** 详情数据源 */
  model?: Record<string, any>;
  /** 字段描述（复用表单 schema，过滤 hideInDetail） */
  schema: (() => VbenFormSchema[]) | VbenFormSchema[];
  /** 通用配置（label 宽度/对齐、样式类） */
  commonConfig?: {
    controlClass?: string;
    formItemClass?: (() => string) | string;
    hideLabel?: boolean;
    labelAlign?: 'left' | 'right';
    labelClass?: string;
    labelWidth?: number;
    wrapperClass?: string;
  };
  /** 布局方式：水平 / 垂直 / 行内 */
  layout?: 'horizontal' | 'inline' | 'vertical';
  /** 顶层加载态：true 时整体显示加载中兜底 */
  loading?: boolean;
  /** 布局容器类（含 grid-cols-* 时自动启用网格布局） */
  wrapperClass?: string;
}

/** 单项渲染异常信息（ErrorBoundary 兜底时向上抛出） */
export interface ViewerErrorInfo {
  error: unknown;
  fieldName?: string;
  info: string;
}
