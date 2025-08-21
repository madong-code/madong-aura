export type MyDialogProps = {
  title?: string
  customClass?: string
  destroyOnClose?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  width?: string | number
  fullscreen?: boolean
  showClose?: boolean
  // 内容区域加载中
  loading?: boolean
  // 确定按钮加载中
  confirmLoading?: boolean
  // 显示确定按钮
  showConfirmButton?: boolean
  // 显示取消按钮
  showCancelButton?: boolean
  // 显示底部
  footer?: boolean
  // 拖拽
  draggable?: boolean
  onConfirm?: () => void
  onCancel?: () => void
  // 弹窗类型
  dialogType?: 'dialog' | 'drawer'
  // 抽屉相关属性
  direction?: 'ltr' | 'rtl' | 'ttb' | 'btt'
  modal?: boolean
  // 插槽相关
  prependFooter?: () => void
  centerFooter?: () => void
  appendFooter?: () => void
}
export interface MyDialogInstance {
  // 打开
  open: () => void
  // 关闭
  close: () => void
  // 设置组件状态（props）
  setState: (state: MyDialogProps) => Promise<void>
  // 获取组件状态（props）
  getState: () => Promise<MyDialogProps>
}
export interface DialogEmits {
  (e: 'register', dialogInstance: any): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}
