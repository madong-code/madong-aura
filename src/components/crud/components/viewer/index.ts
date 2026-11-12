/**
 * 详情查看器（viewer）统一导出。
 *
 * 业务接入：
 *   import { DetailViewer } from '#/components/crud/components/viewer';
 *   import type { DetailViewerProps, ViewerFormatType } from '#/components/crud/components/viewer';
 *   import { formatViewerValue, isEmptyValue } from '#/components/crud/components/viewer';
 */
export {
  addComponent,
  getAllComponents,
  getComponent,
  hasComponent,
  registerReaderComponentToVxe,
  removeComponent,
} from './component-map';

// 多类型格式化工具（纯函数）
export {
  formatAmountValue,
  formatDateValue,
  formatEnumValue,
  formatTextValue,
  formatViewerValue,
  isEmptyValue,
  normalizeListValue,
  safeJsonStringify,
  VIEWER_EMPTY_TEXT,
} from './format';

// 统一类型声明
export type {
  DetailViewerProps,
  ViewerAmountOptions,
  ViewerCommonProps,
  ViewerDateOptions,
  ViewerEnumOption,
  ViewerErrorInfo,
  ViewerFormatOptions,
  ViewerFormatType,
} from './types';

// 主查看器与单项异常边界
export { default as DetailViewer } from './viewer.vue';
export { default as ViewerItemBoundary } from './viewer-item-boundary.vue';
