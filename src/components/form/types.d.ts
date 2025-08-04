export interface FormSchema {
  labelWidth?: string
  schema: FormItemSchema[]
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
  elColSpan?: number
  // 表单组件的插槽
  renderComponentContent?: Record<string, function> | (() => Record<string, function>)
}
