export type MyDialogProps = {
  appendFooter?: () => void;
  centerFooter?: () => void;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  // 确定按钮加载中
  confirmLoading?: boolean;
  customClass?: string;
  destroyOnClose?: boolean;
  // 弹窗类型
  dialogType?: 'dialog' | 'drawer';
  // 抽屉相关属性
  direction?: 'btt' | 'ltr' | 'rtl' | 'ttb';
  // 拖拽
  draggable?: boolean;
  // 显示底部
  footer?: boolean;
  fullscreen?: boolean;
  // 内容区域加载中
  loading?: boolean;
  modal?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  // 插槽相关
  prependFooter?: () => void;
  // 显示取消按钮
  showCancelButton?: boolean;
  showClose?: boolean;
  // 显示确定按钮
  showConfirmButton?: boolean;
  title?: string;
  width?: number | string;
  // z-index 层级
  zIndex?: number;
};
export interface MyDialogInstance {
  // 打开
  open: () => void;
  // 关闭
  close: () => void;
  // 设置组件状态（props）
  setState: (state: MyDialogProps) => Promise<void>;
  // 获取组件状态（props）
  getState: () => Promise<MyDialogProps>;
}
export interface DialogEmits {
  (e: 'register', dialogInstance: any): void;
  (e: 'cancel' | 'confirm'): void;
}
