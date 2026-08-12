/**
 * FormDialog 类型定义
 */

import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';

export type FormDialogType = 'drawer' | 'modal';
export type FormActionType = 'add' | 'edit' | 'view';

export interface FormDialogApiConfig {
  add?: (params: any) => Promise<any>;
  edit?: (params: any) => Promise<any>;
  view?: (id: any) => Promise<any>;
}

export interface FormDialogCommonConfig {
  labelWidth?: number;
  labelAlign?: 'left' | 'right';
  formLabelAlign?: 'left' | 'right';
  detailLabelAlign?: 'left' | 'right';
  labelClass?: string;
  controlClass?: string;
  wrapperClass?: string;
  hideLabel?: boolean;
  hideRequiredMark?: boolean;
  formItemClass?: (() => string) | string;
  componentProps?: Record<string, any>;
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
  /** 表单布局 */
  layout?: 'horizontal' | 'inline' | 'vertical';
  /** Grid 布局 class，用于控制表单列数 */
  wrapperClass?: string;
  draggable?: boolean;
  fullscreenButton?: boolean;
  /** 弹窗组件的 CSS class，例如 'top-0' 让弹窗靠顶部显示 */
  class?: string;
  /** 弹窗层级，默认 undefined（使用组件默认值） */
  zIndex?: number;
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

export interface FormDialogApi {
  openAdd: (data?: Record<string, any>) => void;
  openEdit: (row: Record<string, any>) => void;
  openView: (row: Record<string, any>) => void;
  close: () => void;
  getFormApi: () => any;
  getActionType: () => FormActionType;
  getCurrentRow: () => Record<string, any>;
  show: (params: { data: any; type: FormActionType }) => void;
}
