/**
 * CRUD 组件类型定义
 * 重新导出自 components/types.ts
 */

// 兼容旧版导出（可选）
export type { VbenFormSchema } from '#/adapter/form';

// 从 components 重新导出所有类型
export type {
  // 基础类型
  ActionItem,
  CrudApi,
  CrudApiInstance,
  CrudColumn,
  CrudReadonlyState,
  // Schema
  CrudSchema,
  FormActionType,
  FormDialogApiConfig,
  FormDialogCommonConfig,
  FormDialogConfig,
  FormDialogOptions,
  FormDialogType,
  PaginationConfig,
  PopConfirm,
  // 新配置类型
  SearchFormConfig,
  ToolbarConfig,
  TreeConfig,
} from './components/types';
