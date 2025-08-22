import { TooltipProps } from 'element-plus'
import { VNode } from 'vue'

export interface PopConfirm {
  title: string
  okText?: string
  cancelText?: string
  confirm: Fn
  cancel?: Fn
  icon?: string
}
export interface ActionItem {
  type?: 'danger' | 'info' | 'primary' | 'success' | 'warning'
  link?: boolean
  size?: 'large' | 'default' | 'small'
  onClick?: Fn
  label?: string
  color?: 'error' | 'success' | 'warning'
  icon?: string | VNode
  popConfirm?: PopConfirm
  disabled?: boolean
  divider?: boolean
  // 权限编码控制是否显示
  auth?: string
  // 业务控制是否显示
  ifShow?: ((action: ActionItem) => boolean) | boolean
  tooltip?: string | TooltipProps
  // MessageBox.confirm
  confirm?: any
  // 弹窗组件ref,如果存在，则默认调用其show方法
  dialogRef?: Ref<any>
  // 弹窗组件娄据参数
  dialogParams?: Record<string, any> | ((record: Record<string, any>) => Record<string, any>)
  // action的动态配置
  dynamicProps?: (record: Record<string, any>) => ActionItem
}
