export interface FormSchema {
  gutter?: number // 栅格间隔
  labelWidth?: string
  schema?: FormItemSchema[]
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
  componentProps?: Record<string, any> | ((values: any, formApi: any) => Record<string, any>)
  // 每列的宽度（基于 24 格布局）
  colSpan?: number
  // 表单组件的插槽
  renderComponentContent?: Record<string, function> | (() => Record<string, function>)
  // 校验规则
  rules?: Array<Record<string, any>>
  // 动态判断当前组件是否显示，js 控制，会删除 dom
  ifShow?: ((values: any, formApi: any) => boolean) | boolean
  // 动态判断当前组件是否显示，css 控制，不会删除 dom
  show?: ((values: any, formApi: any) => boolean) | boolean
}
// 定义表单实例方法类型
export interface FormInstance {
  // Element Plus 表单的原生方法
  validate: (callback?: (valid: boolean, fields?: any) => void) => Promise<boolean>
  validateField: (
    props?: string | string[],
    callback?: (valid: boolean, fields?: any) => void
  ) => Promise<void>
  resetFields: (props?: string | string[]) => void
  clearValidate: (props?: string | string[]) => void
  scrollToField: (prop: string) => void

  // 自定义方法
  getValues: () => Promise<Record<string, any>>
  getFormRef: () => any
  // 设置表单值, 默认会过滤不在schema中定义的field, 可通过filterFields形参关闭过滤
  setValues: (
    fields: Record<string, any>,
    filterFields?: boolean,
    shouldValidate?: boolean
  ) => Promise<void>
  // 获取字段组件实例
  getFieldComponentRef: (prop: string) => any
  // 设置组件状态（props）
  setState: (state: FormSchema) => Promise<void>
  // 获取组件状态（props）
  getState: () => Promise<FormSchema>
  // 更新schema
  updateSchema: (data: Partial<FormItemSchema> | Partial<FormItemSchema>[]) => Promise<void>
}

// 表单事件类型
export interface FormEmits {
  (e: 'submit', values: any): void
  (e: 'reset'): void
}
