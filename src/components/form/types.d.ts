export interface FormSchema {
  gutter?: number // 栅格间隔
  labelWidth?: string
  schema: FormItemSchema[]
  // 显示默认操作按钮
  showDefaultActions?: boolean
  // 提交按钮文本
  submitButtonText?: string
  // 重置按钮文本
  resetButtonText?: string
  // 表单验证规则
  rules?: Record<string, any>
}
export interface FormItemSchema {
  labelWidth?: string | number
  // 表单项标签
  label: string
  // 表单项属性名
  prop: string
  // 表单项类型
  component: string
  // 表单组件属性
  componentProps?: Record<string, any>
  // 每列的宽度（基于 24 格布局）
  colSpan?: number
  // 表单组件的插槽
  renderComponentContent?: Record<string, function> | (() => Record<string, function>)
  // 校验规则
  rules?: Array<Record<string, any>>
}
