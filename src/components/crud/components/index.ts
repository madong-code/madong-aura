/**
 * CRUD 组件统一导出
 */

export { useFormDialog } from './dialog';
export { default as FormDialog } from './dialog/dialog.vue';

// 子组件
export { TableAction } from './table-action';

export type { ActionItem, PopConfirm } from './table-action';
// 核心类型
export type {
  CrudApi,
  CrudApiInstance,
  CrudColumn,
  CrudReadonlyState,
  CrudSchema,
  FormDialogConfig,
  PaginationConfig,
  SearchFormConfig,
  ToolbarConfig,
  TreeConfig,
} from './types';

export {
  // 格式化工具
  formatAmountValue,
  formatDateValue,
  formatEnumValue,
  formatTextValue,
  formatViewerValue,
  isEmptyValue,
  // 查看器
  DetailViewer,
} from './viewer';
export type {
  DetailViewerProps,
  ViewerCommonProps,
  ViewerEnumOption,
  ViewerFormatType,
} from './viewer';
